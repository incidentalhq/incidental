from enum import Enum

from httpx import HTTPStatusError, codes
from pydantic import BaseModel

from app.env import settings
from app.exceptions import ValidationError
from app.models import StatusPage
from app.schemas.actions import UpdateStatusPageCustomDomain
from app.services.vercel.client import VercelClient


class ErrorCodes(str, Enum):
    DOMAIN_ALREADY_ADDED = "DOMAIN_ALREADY_ADDED"


class AddDomainResult(BaseModel):
    is_success: bool
    error_code: ErrorCodes | None = None


class CustomDomainService:
    def __init__(self):
        self.client = VercelClient(token=settings.VERCEL_TOKEN)

    def check_domain_is_configured(self, domain: str):
        response = self.client.get_domain_config(domain)
        if not response.misconfigured:
            return True

        if response.configured_by:
            return True

        return False

    def handle_patch_status_page(self, status_page: StatusPage, patch_in: UpdateStatusPageCustomDomain):
        """Handle the custom domain update for a status page"""

        # If the custom domain is being removed
        if patch_in.custom_domain is None and status_page.custom_domain:
            self.remove_domain(status_page.custom_domain)
            status_page.custom_domain = None
            return

        # If the custom domain is being added
        if patch_in.custom_domain:
            self.set_status_page_domain(status_page, patch_in.custom_domain)

    def set_status_page_domain(self, status_page: StatusPage, domain: str):
        if status_page.custom_domain == domain:
            return

        if status_page.custom_domain:
            self.remove_domain(status_page.custom_domain)

        result = self.add_domain(domain)
        if result.is_success:
            status_page.custom_domain = domain
        else:
            if result.error_code == ErrorCodes.DOMAIN_ALREADY_ADDED:
                raise ValidationError("Domain is already added to another project")

    def add_domain(self, domain: str) -> AddDomainResult:
        # Check domain is already added
        response = self.client.get_project_domains(settings.VERCEL_PROJECT_ID)
        for project_domain in response.domains:
            if project_domain.name == domain:
                return AddDomainResult(is_success=True)

        # Otherwise, add the domain
        try:
            self.client.add_project_domain(settings.VERCEL_PROJECT_ID, domain)
            return AddDomainResult(is_success=True)
        except HTTPStatusError as e:
            if e.response.status_code == codes.CONFLICT:
                # 409 Conflict means the domain is already added
                if e.response.json()["error"]["code"] == "duplicate-team-registration":
                    return AddDomainResult(is_success=False, error_code=ErrorCodes.DOMAIN_ALREADY_ADDED)
            raise

    def remove_domain(self, domain: str):
        try:
            self.client.remove_project_domain(settings.VERCEL_PROJECT_ID, domain)
        except HTTPStatusError as e:
            if e.response.status_code == codes.NOT_FOUND:
                # 404 Not Found means the domain is not added
                return
            raise
