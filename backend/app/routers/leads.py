import uuid

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.errors import ApiError
from app.core.logger import logger
from app.crud.base import CRUDBase
from app.models.client import Client
from app.models.contact_submission import ContactSubmission
from app.models.enums import LeadStatus, NotificationType, ProposalStatus
from app.models.lead import Lead
from app.models.lead_activity import LeadActivity
from app.models.proposal import Proposal
from app.models.user import User
from app.schemas.client import ClientOut
from app.schemas.crm import (
    LeadActivityOut, LeadCreate, LeadDisqualifyRequest, LeadLogCallRequest,
    LeadOut, LeadRequirementGatheringRequest, LeadUpdate,
)
from app.services.client_provisioning import provision_client_account
from app.services.lead_pipeline import advance_lead_status, log_lead_activity
from app.services.notification_service import notify_user
from app.services.project_provisioning import provision_project_for_accepted_proposal
from app.utils.pagination import PageParams, page_params
from app.utils.responses import build_pagination_meta, success_response

router = APIRouter(prefix="/leads", tags=["CRM — Leads"], dependencies=[Depends(require_roles("sales", "marketing", "admin", "project_manager"))])

crud = CRUDBase(Lead, searchable_fields=["company", "contact_name", "email"])


def _sales_blocked(current_user: User, lead: Lead) -> bool:
    """Sales users may only touch their own leads — plus unowned ones
    (owner_id IS NULL), which form the not-yet-assigned pool the "Assign to
    Sales" step draws from (CRM audit Issue 1)."""
    return current_user.role == "sales" and lead.owner_id is not None and lead.owner_id != current_user.id


async def _owner_names(db: AsyncSession, owner_ids) -> dict[uuid.UUID, str]:
    ids = {i for i in owner_ids if i}
    if not ids:
        return {}
    users = (await db.execute(select(User).where(User.id.in_(ids)))).scalars().all()
    return {u.id: u.name or u.email for u in users}


async def _lead_out(db: AsyncSession, lead: Lead) -> LeadOut:
    """LeadOut enriched with the owner's display name (CRM audit Issue 1:
    the UI only had a raw owner_id UUID, so nobody could tell who owned a
    lead)."""
    out = LeadOut.model_validate(lead)
    if lead.owner_id:
        out.owner_name = (await _owner_names(db, [lead.owner_id])).get(lead.owner_id)
    return out


async def _lead_out_many(db: AsyncSession, leads) -> list[LeadOut]:
    names = await _owner_names(db, [l.owner_id for l in leads])
    outs = []
    for lead in leads:
        out = LeadOut.model_validate(lead)
        out.owner_name = names.get(lead.owner_id)
        outs.append(out)
    return outs


@router.get("", response_model=dict)
async def list_leads(request: Request, db: AsyncSession = Depends(get_db), page: PageParams = Depends(page_params), current_user: User = Depends(get_current_user)):
    filters = {k: request.query_params.get(k) for k in ("status", "source") if request.query_params.get(k)}
    extra_conditions = None
    if current_user.role == "sales":
        # Issue 1 (CRM audit): sales previously only saw leads they already
        # owned, so every unowned (never-assigned) lead was invisible here.
        # Include the unowned pool so it can be seen and claimed via PATCH.
        extra_conditions = [or_(Lead.owner_id == current_user.id, Lead.owner_id.is_(None))]
    elif owner_id := request.query_params.get("owner_id"):
        filters["owner_id"] = owner_id
    items, total = await crud.list(db, page, filters, extra_conditions=extra_conditions)
    meta = build_pagination_meta(total, page.page, page.limit)
    return success_response(data=await _lead_out_many(db, items), message="Leads fetched", meta=meta)


@router.get("/{lead_id}", response_model=dict)
async def get_lead(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    lead = await crud.get(db, lead_id)
    if _sales_blocked(current_user, lead):
        raise ApiError.forbidden("You do not have access to this lead")
    return success_response(data=await _lead_out(db, lead))


@router.post("", response_model=dict, status_code=201, dependencies=[Depends(require_roles("sales", "marketing", "admin"))])
async def create_lead(payload: LeadCreate, response: Response, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # CRM audit Issue 3: double-clicking Convert (or converting from two
    # views) used to create one lead per click. Idempotent by submission —
    # return the lead that already came from this contact submission.
    if payload.contact_submission_id:
        existing_lead = (
            await db.execute(select(Lead).where(Lead.contact_submission_id == payload.contact_submission_id))
        ).scalar_one_or_none()
        if existing_lead is not None:
            response.status_code = 200
            return success_response(data=await _lead_out(db, existing_lead), message="Contact submission already converted to this lead", status_code=200)
    data = payload.model_dump()
    if not data.get("owner_id") and current_user.role == "sales":
        data["owner_id"] = current_user.id
    lead = await crud.create(db, data)

    # Write back the reverse link so the Contact Submissions view can tell
    # this submission has already been converted (and stop offering the
    # Convert to Lead action for it) — create_lead is the only place a Lead
    # ever gets created from a submission now that it's a manual staff step.
    if lead.contact_submission_id:
        submission = await db.get(ContactSubmission, lead.contact_submission_id)
        if submission and not submission.lead_id:
            submission.lead_id = lead.id
            await db.commit()

    await log_lead_activity(db, lead.id, "lead_created", lead.notes, current_user.id)

    if lead.owner_id and lead.owner_id != current_user.id:
        await notify_user(
            db, lead.owner_id, "New lead assigned to you",
            f"{lead.company or lead.contact_name} was assigned to you as a new lead.",
            NotificationType.info, f"/employee-portal?tab=leads&lead={lead.id}",
        )
    return success_response(data=await _lead_out(db, lead), message="Lead created", status_code=201)


@router.patch("/{lead_id}", response_model=dict, dependencies=[Depends(require_roles("sales", "admin"))])
async def update_lead(lead_id: uuid.UUID, payload: LeadUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = await crud.get(db, lead_id)
    # Real IDOR found during a security audit: GET /leads/{id} already
    # blocked a `sales` user from reading a lead they don't own, but this
    # PATCH had no matching check — any sales user could modify (including
    # reassigning `owner_id` to themselves) a lead owned by a different
    # salesperson, exactly the class of access GET was written to prevent.
    if _sales_blocked(current_user, existing):
        raise ApiError.forbidden("You do not have access to this lead")
    data = payload.model_dump(exclude_unset=True)
    # A sales user touching an unowned lead claims it for themselves (CRM
    # audit Issue 1); the explicit "assign" action is the same PATCH with
    # owner_id set by admin.
    if current_user.role == "sales" and existing.owner_id is None and "owner_id" not in data:
        data["owner_id"] = current_user.id
    previous_owner = existing.owner_id
    lead = await crud.update(db, lead_id, data)

    new_owner = data.get("owner_id")
    if new_owner and str(new_owner) != str(previous_owner) and uuid.UUID(str(new_owner)) != current_user.id:
        await notify_user(
            db, lead.owner_id, "Lead reassigned to you",
            f"{lead.company or lead.contact_name} was reassigned to you.",
            NotificationType.info, f"/employee-portal?tab=leads&lead={lead.id}",
        )
    return success_response(data=await _lead_out(db, lead), message="Lead updated")


@router.delete("/{lead_id}", response_model=dict, dependencies=[Depends(require_roles("admin"))])
async def delete_lead(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await crud.delete(db, lead_id)
    return success_response(message="Lead removed")


@router.get("/{lead_id}/activities", response_model=dict)
async def list_lead_activities(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    lead = await crud.get(db, lead_id)
    if _sales_blocked(current_user, lead):
        raise ApiError.forbidden("You do not have access to this lead")
    items = (
        await db.execute(select(LeadActivity).where(LeadActivity.lead_id == lead_id).order_by(LeadActivity.created_at))
    ).scalars().all()
    return success_response(data=[LeadActivityOut.model_validate(a) for a in items])


@router.post("/{lead_id}/log-call", response_model=dict)
async def log_call(lead_id: uuid.UUID, payload: LeadLogCallRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Step 1 of the pipeline: Log Call. Available on every lead regardless
    of stage (staff keep logging calls throughout the relationship) — but it
    only ever advances status forward out of `new`, never backward, and
    never once the lead is disqualified/converted."""
    lead = await crud.get(db, lead_id)
    if _sales_blocked(current_user, lead):
        raise ApiError.forbidden("You do not have access to this lead")
    existing_note = f"{lead.notes}\n" if lead.notes else ""
    lead.notes = f"{existing_note}[Call Log] {payload.notes}"
    await db.commit()
    await advance_lead_status(db, lead, LeadStatus.contacted)
    await log_lead_activity(db, lead.id, "call_log", payload.notes, current_user.id)
    # The activity-log commit above can leave `lead`'s server-computed
    # columns (updated_at) in a state pydantic can't lazily reload outside
    # an async greenlet — refresh explicitly right before serializing.
    await db.refresh(lead)
    return success_response(data=await _lead_out(db, lead), message="Call logged")


@router.post("/{lead_id}/requirement-gathering", response_model=dict)
async def mark_requirement_gathering(lead_id: uuid.UUID, payload: LeadRequirementGatheringRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Step 2: Requirement Gathering — fired alongside scheduling the demo
    meeting, so the pipeline stage reflects that requirements are being
    actively gathered ahead of drafting a proposal."""
    lead = await crud.get(db, lead_id)
    if _sales_blocked(current_user, lead):
        raise ApiError.forbidden("You do not have access to this lead")
    await advance_lead_status(db, lead, LeadStatus.requirement_gathering)
    await log_lead_activity(db, lead.id, "requirement_gathering", payload.notes, current_user.id)
    await db.refresh(lead)
    return success_response(data=await _lead_out(db, lead), message="Requirement gathering recorded")


@router.post("/{lead_id}/disqualify", response_model=dict)
async def disqualify_lead(lead_id: uuid.UUID, payload: LeadDisqualifyRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Closed-lost branch, reachable from any non-terminal stage before a
    proposal is approved (a lead can go cold at any point up to there, not
    just after a proposal is rejected — see reject_proposal in proposals.py
    for that specific path). Once a proposal is approved the only valid next
    step is converting the lead to a client, not disqualifying it."""
    lead = await crud.get(db, lead_id)
    if _sales_blocked(current_user, lead):
        raise ApiError.forbidden("You do not have access to this lead")
    if lead.status in (LeadStatus.converted, LeadStatus.disqualified):
        raise ApiError.bad_request("This lead is already closed and cannot be disqualified")
    if lead.status == LeadStatus.proposal_approved:
        raise ApiError.bad_request("This lead's proposal was already approved — convert it to a client instead of disqualifying it")
    lead.rejection_reason = payload.reason
    await db.commit()
    await advance_lead_status(db, lead, LeadStatus.disqualified)
    await log_lead_activity(db, lead.id, "disqualified", payload.reason, current_user.id)
    await db.refresh(lead)
    return success_response(data=await _lead_out(db, lead), message="Lead disqualified")


@router.post("/{lead_id}/convert", response_model=dict, dependencies=[Depends(require_roles("admin", "project_manager", "sales"))])
async def convert_lead(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Explicit "Convert Lead to Client" action (workflow doc §3) — provisions
    the client's portal account and sends their credential email right after
    a successful lead evaluation, independent of any proposal/contract that
    may follow. Sales can convert their own won leads directly (that's the
    normal end of their pipeline once a proposal is approved); admin/PM can
    convert any lead.

    Idempotent by design (mirrors the auto-provisioning path contracts.py's
    sign_contract already uses for leads that convert via a signed contract
    instead): re-calling this on an already-converted lead just returns the
    existing client rather than erroring or provisioning a second account —
    a rapid double-click produces exactly one client either way.
    """
    lead = await crud.get(db, lead_id)
    if _sales_blocked(current_user, lead):
        raise ApiError.forbidden("You do not have access to this lead")

    # UAT closure pass §4: nothing blocked converting a disqualified
    # (rejected/closed) lead — it would happily provision a real client
    # account + login credentials for a lead the business already decided
    # not to pursue, violating "Unsuccessful Lead → Reject/Close" (no
    # client/credentials should ever be created on that branch).
    if lead.status == LeadStatus.disqualified:
        raise ApiError.bad_request("This lead was disqualified and cannot be converted to a client")

    if lead.status == LeadStatus.converted and lead.converted_client_id:
        existing = (await db.execute(select(Client).where(Client.id == lead.converted_client_id))).scalar_one_or_none()
        if existing is not None:
            return success_response(data=ClientOut.model_validate(existing), message="Lead was already converted to this client")

    try:
        client = await provision_client_account(db, lead)
    except Exception as exc:  # noqa: BLE001 — surfaced to the caller; unlike the contract-sign path there's no other side effect to protect here
        logger.error(f"Client account provisioning failed for lead {lead.id}: {exc}")
        raise ApiError.bad_request("Could not provision the client account. Please try again.") from exc

    if client is None:
        raise ApiError.bad_request("Could not provision the client account. Please try again.")

    lead = await crud.update(db, lead.id, {"status": LeadStatus.converted, "converted_client_id": client.id})
    await log_lead_activity(db, lead.id, "converted", f"Converted to client account {client.company_name or client.id}")

    # The pipeline places "Convert to Client" after "Proposal Approved", so
    # by the time this runs there's usually already an accepted proposal
    # waiting on project auto-creation — provision_project_for_accepted_proposal
    # no-ops with just a warning log when called from accept_proposal before
    # the lead has a converted_client_id, so this is what actually creates
    # the project (and notifies the PM with the client now known) for the
    # normal accept-then-convert order. Idempotent either way.
    accepted_proposal = (
        await db.execute(select(Proposal).where(Proposal.lead_id == lead.id, Proposal.status == ProposalStatus.accepted))
    ).scalar_one_or_none()
    if accepted_proposal is not None:
        try:
            await provision_project_for_accepted_proposal(db, accepted_proposal)
        except Exception as exc:  # noqa: BLE001 — the client account is already committed; a project-creation hiccup must not undo it
            logger.error(f"Auto project creation failed after converting lead {lead.id}: {exc}")

    return success_response(data=ClientOut.model_validate(client), message="Lead converted to client", status_code=201)
