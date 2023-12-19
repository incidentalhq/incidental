from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.db import get_db
from app.exceptions import ErrorCodes, FormFieldValidationError, ValidationError
from app.models import User
from app.repos import AnnouncementRepo, FormRepo, IncidentRepo, OrganisationRepo, SeverityRepo, UserRepo
from app.schemas.actions import AuthUserSchema, CreateUserSchema
from app.schemas.models import UserSchema
from app.services.identity import IdentityService
from app.services.login import LoginError, LoginService
from app.services.onboarding import OnboardingService
from app.services.security import SecurityService

router = APIRouter(tags=["Users"])


@router.post("", response_model=UserSchema)
def user_register(create_in: CreateUserSchema, session: Session = Depends(get_db)):
    """Create a new user account"""
    user_repo = UserRepo(session=session)
    organisation_repo = OrganisationRepo(session=session)
    form_repo = FormRepo(session=session)
    severity_repo = SeverityRepo(session=session)
    incident_repo = IncidentRepo(session=session)
    announcement_repo = AnnouncementRepo(session=session)

    identity_service = IdentityService(
        user_repo,
        organisation_repo,
    )

    user = identity_service.create_account(create_in=create_in)

    onboarding_service = OnboardingService(
        form_repo=form_repo,
        severity_repo=severity_repo,
        incident_repo=incident_repo,
        announcement_repo=announcement_repo,
    )
    onboarding_service.setup_organisation(organisation=user.organisations[0])
    session.commit()

    return user


@router.post("/auth", response_model=UserSchema)
def authenticate_user(item: AuthUserSchema, db: Session = Depends(get_db)):
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
                ErrorCodes.USER_NOT_VERIFIED,
            )

        raise FormFieldValidationError("Could not login, please try again", "general")

    return result.user


@router.get("/me", response_model=UserSchema)
def me(
    user: User = Depends(get_current_user),
):
    """Get current user"""
    return user
