from fastapi import APIRouter, HTTPException, Response, status

from app.deps import CurrentOrganisation, CurrentUser, DatabaseSession, EventsService
from app.exceptions import ErrorCodes, FormFieldValidationError, ValidationError
from app.repos import InviteRepo, OrganisationRepo, UserRepo
from app.schemas.actions import AuthUserSchema, CreateUserSchema, SendVerificationEmailSchema, VerifyEmailSchema
from app.schemas.models import OrganisationMemberSchema, UserSchema
from app.schemas.resources import PaginatedResults
from app.schemas.tasks import SendVerificationEmailParameters
from app.services.factories import create_onboarding_service
from app.services.identity import IdentityService
from app.services.login import LoginError, LoginService
from app.services.security import SecurityService

router = APIRouter(tags=["Users"])


@router.post("", response_model=UserSchema)
def user_register(create_in: CreateUserSchema, session: DatabaseSession, events: EventsService):
    """Create a new user account"""
    user_repo = UserRepo(session=session)
    organisation_repo = OrganisationRepo(session=session)
    invite_repo = InviteRepo(session=session)
    identity_service = IdentityService(
        user_repo,
        organisation_repo,
        invite_repo,
    )

    create_account_result = identity_service.create_account(create_in=create_in)
    onboarding_service = create_onboarding_service(session=session)

    if create_account_result.is_new_organisation:
        onboarding_service.setup_organisation(organisation=create_account_result.user.organisations[0])

    events.queue_job(
        SendVerificationEmailParameters(
            user_id=create_account_result.user.id,
        )
    )

    session.commit()

    return create_account_result.user


@router.post("/auth", response_model=UserSchema)
def authenticate_user(item: AuthUserSchema, db: DatabaseSession):
    """Auth user"""
    repo = UserRepo(db)
    security_service = SecurityService(db)

    login_service = LoginService(repo, security_service)
    result = login_service.try_login(item.email_address, item.password)

    db.commit()

    if not result.success:
        if result.error == LoginError.EXCEEDED_MAX_LOGIN_ATTEMPTS:
            raise ValidationError(
                "Exceeded login attempts, please wait 15 minutes before attempting again",
                ErrorCodes.EXCEEDED_MAX_LOGIN_ATTEMPTS,
            )
        elif result.error == LoginError.NOT_VERIFIED:
            raise ValidationError(
                "Your email address is not verified, please check your email",
                ErrorCodes.ACCOUNT_NOT_VERIFIED,
            )

        raise FormFieldValidationError("Could not login, please try again", "general")

    return result.user


@router.get("/me", response_model=UserSchema)
def me(
    user: CurrentUser,
):
    """Get current user"""
    return user


@router.get("/search", response_model=PaginatedResults[OrganisationMemberSchema])
def users_search(user: CurrentUser, db: DatabaseSession, organisation: CurrentOrganisation):
    """Get all users in the organisation"""
    user_repo = UserRepo(session=db)

    results = user_repo.get_all_organisation_members(organisation=organisation)
    total = len(results)

    return PaginatedResults(total=total, page=1, size=total, items=results)


@router.post("/verify")
def user_verify(item: VerifyEmailSchema, db: DatabaseSession):
    repo = UserRepo(db)
    user = repo.get_by_email_address(item.email_address)
    if not user:
        raise ValidationError("Could not verify code", code=ErrorCodes.INCORRECT_CODE)

    if user.is_email_verified:
        raise ValidationError("This account is already verified", ErrorCodes.ALREADY_VERIFIED)

    security_service = SecurityService(db)

    try:
        security_service.validate_otp_code(user, item.code)
        user.is_email_verified = True
    finally:
        db.commit()

    return Response(status_code=status.HTTP_202_ACCEPTED)


@router.post("/send-verification")
def user_send_verification(item: SendVerificationEmailSchema, db: DatabaseSession, events: EventsService):
    repo = UserRepo(db)
    user = repo.get_by_email_address(item.email_address)
    if not user:
        raise HTTPException(404, "User not found")

    events.queue_job(
        SendVerificationEmailParameters(
            user_id=user.id,
        )
    )

    return Response(status_code=status.HTTP_202_ACCEPTED)
