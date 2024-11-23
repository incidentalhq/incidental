from datetime import datetime

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class BaseVercelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        from_attributes=True,
        populate_by_name=True,
        extra="forbid",
    )


class Pagination(BaseVercelModel):
    count: int
    next: int | None
    prev: int | None


class ProjectDomainVerificationChallenge(BaseVercelModel):
    domain: str
    reason: str
    type: str
    value: str


class ProjectDomain(BaseVercelModel):
    apex_name: str
    created_at: datetime
    custom_environment_id: str | None = None
    git_branch: str | None = None
    name: str
    project_id: str
    redirect: str | None = None
    redirect_status_code: int | None = None
    updated_at: datetime
    verification: list[ProjectDomainVerificationChallenge] | None = None
    verified: bool


class DomainConfig(BaseVercelModel):
    configured_by: str | None = None
    nameservers: list[str]
    service_type: str
    cnames: list[str]
    a_values: list[str]
    conflicts: list[str]
    accepted_challenges: list[str]
    misconfigured: bool


class ListProjectDomainsResponse(BaseVercelModel):
    pagination: Pagination
    domains: list[ProjectDomain]
