import uuid
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.utils.responses import success_response
from app.crud.base import CRUDBase
from app.models.permission import Permission
from app.models.role import Role
from app.schemas.role import (
    PermissionCreate,
    PermissionOut,
    PermissionUpdate,
    RoleCreate,
    RoleOut,
    RolePermissionsPayload,
    RoleUpdate,
)
from app.utils.router_factory import build_crud_router

router = APIRouter(prefix="/access-control", dependencies=[Depends(require_roles("admin"))])

role_crud = CRUDBase(Role, searchable_fields=["name"], relationships=["permissions"])
permission_crud = CRUDBase(Permission, searchable_fields=["name", "module"])

role_router = build_crud_router(
    role_crud, RoleCreate, RoleUpdate, RoleOut,
    prefix="/roles", tags=["Roles"], write_roles=["admin"],
)
permission_router = build_crud_router(
    permission_crud, PermissionCreate, PermissionUpdate, PermissionOut,
    prefix="/permissions", tags=["Permissions"], write_roles=["admin"],
    allowed_filters=["module"],
)

@router.put("/roles/{role_id}/permissions", dependencies=[Depends(require_roles("admin"))], response_model=dict)
@router.post("/roles/{role_id}/permissions", dependencies=[Depends(require_roles("admin"))], response_model=dict)
async def assign_role_permissions(
    role_id: uuid.UUID,
    payload: RolePermissionsPayload,
    db: AsyncSession = Depends(get_db),
):
    role = await role_crud.get(db, role_id)
    if payload.permission_ids:
        perms_result = await db.execute(select(Permission).where(Permission.id.in_(payload.permission_ids)))
        role.permissions = list(perms_result.scalars().all())
    else:
        role.permissions = []
    await db.commit()
    await db.refresh(role, attribute_names=["permissions"])
    return success_response(data=RoleOut.model_validate(role), message="Permissions assigned to role successfully")

router.include_router(role_router)
router.include_router(permission_router)
