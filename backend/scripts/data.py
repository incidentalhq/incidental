import structlog
import typer

from app.db import session_factory
from app.models import User
from app.repos import UserRepo
from app.schemas.actions import CreateUserSchema
from app.services.identity import IdentityService
from app.utils import setup_logger

setup_logger()

app = typer.Typer(no_args_is_help=True)
logger = structlog.get_logger(logger_name="script")


@app.command()
def make_user(name: str, email: str, password: str) -> User:
    db = session_factory()
    user_repo = UserRepo(db)

    identity_service = IdentityService(
        db,
        user_repo,
    )

    item = CreateUserSchema(
        name=name,
        email_address=email,
        password=password,
    )

    user = identity_service.create_account(item)
    user.is_email_verified = True
    logger.info("Created new user", user=item)

    db.commit()

    return user


if __name__ == "__main__":
    app()
