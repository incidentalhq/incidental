from typing import Annotated

from fastapi import Query
from pydantic import ConfigDict, EmailStr, StringConstraints

from app.models import IncidentStatusCategoryEnum

from .base import BaseSchema
from .models import ModelIdSchema


class AuthUserSchema(BaseSchema):
    email_address: EmailStr
    password: str


class CreateUserSchema(BaseSchema):
    name: str
    email_address: EmailStr
    password: Annotated[str, StringConstraints(min_length=8)]
    slack_user_id: str | None = None
    is_email_verified: bool = False


class OAuth2AuthorizationResultSchema(BaseSchema):
    code: str


class PaginationParamsSchema(BaseSchema):
    page: int = 1
    size: int = 25

    @classmethod
    def as_query(cls, page: int = Query(1), size: int = Query(25)):
        return PaginationParamsSchema(page=page, size=size)


class IncidentSearchSchema(PaginationParamsSchema):
    q: str | None = None
    status_category: list[IncidentStatusCategoryEnum] | None = None

    @classmethod
    def as_query(
        cls,
        page: int = Query(1),
        size: int = Query(25),
        q: str | None = Query(None),
        status_category: Annotated[list[IncidentStatusCategoryEnum] | None, Query(alias="statusCategory")] = None,
    ) -> "IncidentSearchSchema":
        return IncidentSearchSchema(
            page=page,
            size=size,
            q=q,
            status_category=status_category,
        )


class PatchIncidentSchema(BaseSchema):
    name: str | None = None
    description: str | None = None
    incident_status: ModelIdSchema | None = None
    incident_severity: ModelIdSchema | None = None


class ExtendedPatchIncidentSchema(PatchIncidentSchema):
    slack_channel_name: str | None = None
    slack_channel_id: str | None = None


class AllowAllSchema(BaseSchema):
    """Allows any/all values"""

    model_config = ConfigDict(extra="allow")


class CreateIncidentSchema(BaseSchema):
    incident_name: str
    incident_type: str
    incident_severity: str
    summary: str | None = None

    model_config = ConfigDict(extra="allow")


class CreateSeveritySchema(BaseSchema):
    name: str
    description: str
    rating: int | None = None


class PatchSeveritySchema(BaseSchema):
    name: str | None = None
    description: str | None = None
    rating: int | None = None


class PatchTimestampSchema(BaseSchema):
    pass


class CreateTimestampSchema(BaseSchema):
    label: str
    description: str
