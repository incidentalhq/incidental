import httpx
import structlog
from httpx import Response

from app.services.vercel.models import DomainConfig, ListProjectDomainsResponse, ProjectDomain

logger = structlog.get_logger(logger_name=__name__)


class VercelClient:
    def __init__(self, token: str, timeout: int = 10, base_url: str = "https://api.vercel.com"):
        self.token = token
        self.client = httpx.Client(
            base_url=base_url,
            headers={"Authorization": f"Bearer {token}"},
            timeout=timeout,
        )
        # add a hook to log errors to the console
        self.client.event_hooks["response"].append(self.log_error)

    def log_error(self, response: Response):
        if 400 <= response.status_code < 600:
            response.read()
            logger.error(
                "Request failed",
                status_code=response.status_code,
                url=response.url,
                method=response.request.method,
                response_text=response.text,
            )

    def get_project_domains(self, project_id: str) -> ListProjectDomainsResponse:
        """Get a list of domains for a project."""
        response = self.client.get(f"/v9/projects/{project_id}/domains")
        response.raise_for_status()
        return ListProjectDomainsResponse.model_validate(response.json())

    def add_project_domain(self, project_id: str, domain: str) -> ProjectDomain:
        """Add a domain to a project."""
        response = self.client.post(f"/v10/projects/{project_id}/domains", json={"name": domain})
        response.raise_for_status()
        return ProjectDomain.model_validate(response.json())

    def get_domain_config(self, domain_id: str) -> DomainConfig:
        """Get the configuration for a domain."""
        response = self.client.get(f"/v6/domains/{domain_id}/config")
        response.raise_for_status()
        return DomainConfig.model_validate(response.json())

    def get_project_domain(self, project_id: str, domain_id: str) -> ProjectDomain:
        """Get a domain for a project."""
        response = self.client.get(f"/v9/projects/{project_id}/domains/{domain_id}")
        response.raise_for_status()
        logger.info(response.json())
        return ProjectDomain.model_validate(response.json())

    def remove_project_domain(self, project_id: str, domain_id: str):
        """Remove a domain from a project."""
        response = self.client.delete(f"/v9/projects/{project_id}/domains/{domain_id}")
        response.raise_for_status()
        return response
