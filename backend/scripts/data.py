import structlog
import typer

from app.db import session_factory
from app.repos import UserRepo
from app.utils import setup_logger

setup_logger()

app = typer.Typer(no_args_is_help=True)
logger = structlog.get_logger(logger_name="script")


@app.command(help="Set password for user")
def set_password(email: str, password: str):
    db = session_factory()
    user_repo = UserRepo(db)

    user = user_repo.get_by_email_address(email)
    if not user:
        logger.error("Could not find user")
        return

    user.password = password
    db.commit()

    logger.info("Password updated")


if __name__ == "__main__":
    app()
