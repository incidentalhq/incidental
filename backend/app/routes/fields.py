import structlog
from fastapi import APIRouter

from app.deps import CurrentOrganisation, CurrentUser, DatabaseSession
from app.exceptions import NotPermittedError
from app.models import FieldKind
from app.repos import FieldRepo
from app.schemas.actions import CreateFieldSchema, PatchFieldSchema
from app.schemas.models import FieldSchema
from app.schemas.resources import PaginatedResults

logger = structlog.get_logger(logger_name=__name__)

router = APIRouter(tags=["Fields"])


@router.get("/search", response_model=PaginatedResults[FieldSchema])
async def fields_search(
    user: CurrentUser,
    db: DatabaseSession,
    organisation: CurrentOrganisation,
):
    """Get fields for organisation"""
    field_repo = FieldRepo(session=db)
    results = field_repo.get_all_fields(organisation=organisation)

    return PaginatedResults(total=len(results), page=1, size=len(results), items=results)


@router.post("", response_model=FieldSchema)
async def fields_create(
    user: CurrentUser,
    db: DatabaseSession,
    create_in: CreateFieldSchema,
    organisation: CurrentOrganisation,
):
    """Create a new field"""
    field_repo = FieldRepo(session=db)

    field = field_repo.create_field(
        organisation=organisation,
        label=create_in.label,
        interface_kind=create_in.interface_kind,
        kind=FieldKind.USER_DEFINED,
        description=create_in.description,
        available_options=create_in.available_options,
    )

    db.commit()

    return field


@router.patch("/{id}", response_model=FieldSchema)
async def fields_patch(
    id: str,
    user: CurrentUser,
    db: DatabaseSession,
    patch_in: PatchFieldSchema,
):
    """Patch existing field"""
    field_repo = FieldRepo(session=db)
    field = field_repo.get_field_by_id_or_throw(id=id)

    if not user.belongs_to(field.organisation):
        raise NotPermittedError()

    field_repo.patch_field(field=field, patch_in=patch_in)

    db.commit()

    return field


@router.delete("/{id}", response_model=FieldSchema)
async def fields_delete(
    id: str,
    user: CurrentUser,
    db: DatabaseSession,
):
    """Delete field"""
    field_repo = FieldRepo(session=db)
    field = field_repo.get_field_by_id_or_throw(id=id)

    if not user.belongs_to(field.organisation):
        raise NotPermittedError()

    field_repo.soft_delete_field(field)

    db.commit()

    return field
