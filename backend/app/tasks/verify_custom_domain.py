from app.repos import StatusPageRepo
from app.schemas.tasks import VerifyCustomDomainParameters
from app.services.custom_domain import CustomDomainService

from .base import BaseTask


class VerifyCustomDomainTask(BaseTask["VerifyCustomDomainParameters"]):
    def execute(self, parameters: "VerifyCustomDomainParameters") -> None:
        status_page_repo = StatusPageRepo(self.session)
        custom_domain_service = CustomDomainService()

        status_pages = status_page_repo.get_unverified_custom_domains()

        for status_page in status_pages:
            assert status_page.custom_domain is not None  # should be checked in the repo
            is_verified = custom_domain_service.check_domain_is_configured(status_page.custom_domain)
            if is_verified:
                status_page.is_custom_domain_verified = True

        self.session.commit()
