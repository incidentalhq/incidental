from fastapi import APIRouter

from app.deps import CurrentOrganisation, CurrentUser, DatabaseSession
from app.exceptions import ErrorCodes, FormFieldValidationError, ValidationError
from app.repos import OrganisationRepo, UserRepo
from app.schemas.actions import AuthUserSchema, CreateUserSchema
from app.schemas.models import UserPublicSchema, UserSchema
from app.schemas.resources import PaginatedResults
from app.services.factories import create_onboarding_service
from app.services.identity import IdentityService
from app.services.login import LoginError, LoginService
from app.services.security import SecurityService

router = APIRouter(tags=["Users"])


@router.post("", response_model=UserSchema)
def user_register(create_in: CreateUserSchema, session: DatabaseSession):
    """Create a new user account"""
    user_repo = UserRepo(session=session)
    organisation_repo = OrganisationRepo(session=session)
    identity_service = IdentityService(
        user_repo,
        organisation_repo,
    )

    user = identity_service.create_account(create_in=create_in)

    onboarding_service = create_onboarding_service(session=session)
    onboarding_service.setup_organisation(organisation=user.organisations[0])
    session.commit()

    return user


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


@router.get("/search", response_model=PaginatedResults[UserPublicSchema])
def users_search(user: CurrentUser, db: DatabaseSession, organisation: CurrentOrganisation):
    """Get all users in the organisation"""
    user_repo = UserRepo(session=db)

    users = user_repo.get_all_users_in_organisation(organisation=organisation)
    total = len(users)

    return PaginatedResults(total=total, page=1, size=total, items=users)
