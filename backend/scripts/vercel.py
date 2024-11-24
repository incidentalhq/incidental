import structlog
import typer

from app.env import settings
from app.services.vercel.client import VercelClient
from app.utils import setup_logger

setup_logger()

app = typer.Typer(no_args_is_help=True)
logger = structlog.get_logger(logger_name=__name__)


@app.command(help="Get project domains")
def get_project_domains(project_id: str):
    token = settings.VERCEL_TOKEN
    vercel_client = VercelClient(token=token)
    response = vercel_client.get_project_domains(project_id)
    logger.info("Project domains", response=response.model_dump())


@app.command(help="Add project domain")
def add_project_domain(project_id: str, domain: str):
    token = settings.VERCEL_TOKEN
    vercel_client = VercelClient(token=token)
    response = vercel_client.add_project_domain(project_id, domain)
    logger.info("Project domain added", response=response.model_dump())


@app.command(help="Get domain config")
def get_domain_config(domain_id: str):
    token = settings.VERCEL_TOKEN
    vercel_client = VercelClient(token=token)
    response = vercel_client.get_domain_config(domain_id)
    logger.info("Domain config", response=response.model_dump())


if __name__ == "__main__":
    app()
