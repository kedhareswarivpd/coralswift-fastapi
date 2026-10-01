"""Transactional email via Brevo's HTTP API (https://api.brevo.com/v3/smtp/email)
— not SMTP. One Brevo account/API key serves every environment (local dev
and staging both send through Brevo, per explicit instruction); there is no
separate SMTP-relay code path anymore.

Brevo requires the sender address to be a verified sender/domain in that
Brevo account — an unverified `brevo_sender_email` will make every send fail
with a 4xx from Brevo's API (visible in the logged response body), not a
silent failure.
"""
import html

import httpx

from app.core.config import settings
from app.core.logger import logger

_BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email"


async def send_email(to: str, subject: str, html_body: str) -> None:
    if not settings.brevo_api_key:
        logger.info("[email:skipped, no BREVO_API_KEY configured] to=%s subject=%s", to, subject)
        return

    payload = {
        "sender": {"email": settings.brevo_sender_email, "name": settings.brevo_sender_name},
        "to": [{"email": to}],
        "subject": subject,
        "htmlContent": html_body,
    }
    headers = {
        "api-key": settings.brevo_api_key,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(_BREVO_SEND_URL, json=payload, headers=headers)
        if response.status_code >= 400:
            logger.error("Brevo rejected email to %s (status %s): %s", to, response.status_code, response.text[:500])
            print(f"\n================ [EMAIL FALLBACK PRINT - BREVO REJECTED {response.status_code}] ================\nTO: {to}\nSUBJECT: {subject}\nBODY:\n{html_body}\n=================================================================================\n")
            return
        logger.info("Email sent to %s: %s", to, subject)
    except Exception as exc:  # noqa: BLE001 — email delivery must never crash the caller's request
        logger.error("Failed to send email to %s via Brevo: %s", to, exc)
        print(f"\n================ [EMAIL FALLBACK PRINT - EXCEPTION] ================\nTO: {to}\nSUBJECT: {subject}\nBODY:\n{html_body}\n====================================================================\n")



def _esc(value: object) -> str:
    return html.escape(str(value if value is not None else ""), quote=True)


async def send_welcome_email(name: str, email: str) -> None:
    await send_email(
        email,
        f"Welcome to {settings.app_name}",
        f"<p>Hi {_esc(name)},</p><p>Your account has been created successfully.</p>",
    )


async def send_password_reset_email(name: str, email: str, reset_url: str) -> None:
    safe_name = _esc(name)
    safe_url = _esc(reset_url)
    await send_email(
        email,
        "Password Reset Request",
        f"<p>Hi {safe_name},</p><p>Click the link below to reset your password. This link expires in 1 hour.</p>"
        f'<p><a href="{safe_url}">{safe_url}</a></p>',
    )


async def send_verification_email(name: str, email: str, verify_url: str) -> None:
    safe_name = _esc(name)
    safe_url = _esc(verify_url)
    await send_email(
        email,
        f"Verify your {settings.app_name} email",
        f"<p>Hi {safe_name},</p><p>Please verify your email address to finish setting up your account. "
        f"This link expires in 24 hours.</p><p><a href=\"{safe_url}\">{safe_url}</a></p>",
    )


async def send_password_changed_notification(name: str, email: str) -> None:
    """Sent after a successful password change/reset — a standard security
    notification so the account owner notices if it wasn't them."""
    await send_email(
        email,
        f"Your {settings.app_name} password was changed",
        f"<p>Hi {_esc(name)},</p><p>Your password was just changed. If this wasn't you, "
        f"contact support immediately — all other active sessions have been signed out.</p>",
    )


async def send_mfa_enabled_notification(name: str, email: str) -> None:
    await send_email(
        email,
        f"Two-factor authentication enabled on your {settings.app_name} account",
        f"<p>Hi {_esc(name)},</p><p>Two-factor authentication was just turned on for your account. "
        f"If this wasn't you, contact support immediately.</p>",
    )


async def send_mfa_disabled_notification(name: str, email: str) -> None:
    await send_email(
        email,
        f"Two-factor authentication disabled on your {settings.app_name} account",
        f"<p>Hi {_esc(name)},</p><p>Two-factor authentication was just turned off for your account. "
        f"If this wasn't you, contact support immediately and re-enable it.</p>",
    )


async def send_meeting_scheduled_email(
    name: str, email: str, title: str, scheduled_at_display: str, duration_minutes: int, meeting_link: str | None, agenda: str | None,
) -> None:
    """Workflow doc §13: "Meeting Scheduled -> Client Notification + Email
    Notification" — the client "should receive: In-app notification, Email
    notification". This was entirely missing (create_meeting only wrote the
    row, no notify_user/email call at all)."""
    safe_name = _esc(name)
    link_html = f'<p><strong>Join:</strong> <a href="{_esc(meeting_link)}">{_esc(meeting_link)}</a></p>' if meeting_link else ""
    agenda_html = f"<p><strong>Agenda:</strong> {_esc(agenda)}</p>" if agenda else ""
    await send_email(
        email,
        f"Meeting scheduled: {title}",
        f"<p>Hi {safe_name},</p>"
        f"<p>A meeting has been scheduled with you.</p>"
        f"<p><strong>{_esc(title)}</strong></p>"
        f"<p><strong>When:</strong> {_esc(scheduled_at_display)} ({duration_minutes} min)</p>"
        f"{link_html}{agenda_html}",
    )


async def send_proposal_email(name: str, email: str, scope_summary: str, price: float, currency: str) -> None:
    safe_name = _esc(name)
    await send_email(
        email,
        f"Your Proposal from {settings.app_name}",
        f"<p>Hi {safe_name},</p><p>Thank you for your interest. Please find your proposal details below:</p>"
        f"<p><strong>Scope of Work:</strong> {_esc(scope_summary)}</p>"
        f"<p><strong>Price:</strong> {_esc(currency)} {_esc(f'{price:,.2f}')}</p>"
        f"<p>If you have any questions or would like to proceed, just reply to this email.</p>",
    )


async def send_contact_notification(name: str, email: str, message: str, subject: str | None) -> None:
    await send_email(
        settings.brevo_sender_email,
        f"New Contact Form Submission: {subject or 'General Inquiry'}",
        f"<p><strong>Name:</strong> {_esc(name)}</p><p><strong>Email:</strong> {_esc(email)}</p>"
        f"<p><strong>Message:</strong> {_esc(message)}</p>",
    )


async def send_project_confirmed_email(
    name: str, email: str, project_title: str, budget: float = 0.0, currency: str = "USD", overview: str | None = None
) -> None:
    """Sent to the client when a project is confirmed/provisioned (via contract signature,
    proposal acceptance, or manual project creation)."""
    safe_name = _esc(name)
    safe_title = _esc(project_title)
    safe_overview = _esc(overview) if overview else ""
    client_portal_url = f"{settings.client_url.rstrip('/')}/client"

    overview_html = f"<p><strong>Project Overview:</strong> {safe_overview}</p>" if safe_overview else ""
    budget_html = f"<p><strong>Budget:</strong> {_esc(currency)} {_esc(f'{budget:,.2f}')}</p>" if budget > 0 else ""

    await send_email(
        email,
        f"Project Confirmed: {safe_title}",
        f"<p>Hi {safe_name},</p>"
        f"<p>Great news! Your project has been officially confirmed and setup in our system.</p>"
        f"<p><strong>Project Title:</strong> {safe_title}</p>"
        f"{overview_html}"
        f"{budget_html}"
        f"<p>You can monitor project progress, task updates, and deliverables in your Client Portal:</p>"
        f'<p><a href="{_esc(client_portal_url)}">{_esc(client_portal_url)}</a></p>'
        f"<p>Thank you for partnering with {settings.app_name}!</p>",
    )


async def send_contract_signing_email(
    name: str, email: str, contract_id: object, scope_summary: str, price: float, currency: str
) -> None:
    """Sent to the client when a contract is generated, providing a direct link to review
    and sign the contract online."""
    safe_name = _esc(name)
    signing_url = f"{settings.client_url.rstrip('/')}/sign-contract/{contract_id}"

    await send_email(
        email,
        f"Contract Ready for Digital Signature — {settings.app_name}",
        f"<p>Hi {safe_name},</p>"
        f"<p>Your contract has been prepared and is ready for your review and digital signature.</p>"
        f"<p><strong>Scope Summary:</strong> {_esc(scope_summary)}</p>"
        f"<p><strong>Total Value:</strong> {_esc(currency)} {_esc(f'{price:,.2f}')}</p>"
        f"<p>Please click the link below to review and sign your contract online:</p>"
        f'<p><a href="{_esc(signing_url)}" style="display:inline-block;padding:10px 20px;background-color:#2563EB;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">Review & Sign Contract Online</a></p>'
        f'<p>Or open this link: <a href="{_esc(signing_url)}">{_esc(signing_url)}</a></p>',
    )


