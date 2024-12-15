from fastapi import APIRouter, Response, status

from app.deps import CurrentOrganisation, CurrentUser, DatabaseSession, EventsService
from app.exceptions import FormFieldValidationError
from app.repos import InviteRepo, UserRepo
from app.schemas.actions import CreateInviteSchema
from app.schemas.models import InviteSchema
from app.schemas.resources import PaginatedResults
from app.schemas.tasks import SendInviteTaskParameters

router = APIRouter(tags=["Invites"])


@router.get("/search", response_model=PaginatedResults[InviteSchema])
async def invite_search(db: DatabaseSession, user: CurrentUser, organisation: CurrentOrganisation):
    """Get all active invites"""
    repo = InviteRepo(db)
    invites = repo.get_pending_invites_in_organisation(organisation=organisation)

    return PaginatedResults(total=len(invites), page=1, size=len(invites), items=invites)


@router.post("", response_model=InviteSchema)
async def invite_create(
    create_in: CreateInviteSchema,
    db: DatabaseSession,
    user: CurrentUser,
    organisation: CurrentOrganisation,
    events: EventsService,
):
    """Send an invite"""
    invite_repo = InviteRepo(db)
    user_repo = UserRepo(db)

    # is email already in use within this organisation?
    exists = user_repo.get_organisation_member_by_email_address(
        organisation=organisation, email_address=create_in.email_address
    )
    if exists:
        raise FormFieldValidationError("That email is already in use within this organisation", "emailAddress")

    # has an invite already been sent to this email address?
    invites = invite_repo.get_pending_invites_by_email_address(
        organisation=organisation, email_address=create_in.email_address
    )
    if invites:
        raise FormFieldValidationError("Invite has already been sent to that address", "emailAddress")

    invite = invite_repo.create_invite(organisation=organisation, user=user, email_address=create_in.email_address)
    db.commit()

    # send email
    events.queue_job(SendInviteTaskParameters(invite_id=invite.id))

    return invite


@router.delete("/{id}")
async def invite_delete(id: str, db: DatabaseSession, user: CurrentUser):
    """Delete invite"""
    repo = InviteRepo(db)
    invite = repo.get_by_id_or_raise(id)

    repo.delete_invite(invite)
    db.commit()

    return Response(status_code=status.HTTP_202_ACCEPTED)
