import re
from datetime import datetime
from typing import Annotated

import pytz
from fastapi import Query
from pydantic import ConfigDict, EmailStr, StringConstraints, field_validator

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


class CreateUserViaSlackSchema(CreateUserSchema):
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


class PatchIncidentTimestampsSchema(BaseSchema):
    timezone: str
    values: dict[str, datetime | None]

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, v: str) -> str:
        if v not in pytz.all_timezones_set:
            raise ValueError(f"Invalid timezone: {v}")
        return v


class PatchOrganisationSettingsSchema(BaseSchema):
    slack_channel_name_format: str | None = None
    incident_reference_format: str | None = None
    slack_announcement_channel_name: str | None = None

    @field_validator("slack_channel_name_format")
    def validate_slack_channel_name_format(cls, v: str | None):
        allowed_keys = ["{YYYY}", "{MM}", "{DD}", "{name}"]
        cls._validate_template_tags(v=v, allowed_tags=allowed_keys)

        return v

    @field_validator("incident_reference_format")
    def validate_incident_reference_format(cls, v: str | None):
        allowed_keys = ["{id}"]
        cls._validate_template_tags(v=v, allowed_tags=allowed_keys)

        return v

    @classmethod
    def _validate_template_tags(
        cls,
        v: str | None,
        allowed_tags: list[str],
        error_message: str = "Invalid template tag found: {}, allow tags: {}",
    ):
        template_pattern = re.compile(r"\{[^}]*\}")

        if not v:
            return v

        # Check if there are any template-like strings not in allowed_keys
        found_keys = template_pattern.findall(v)
        for key in found_keys:
            if key not in allowed_tags:
                raise ValueError(error_message.format(key, ", ".join(allowed_tags)))

        return v


class UpdateIncidentRoleSchema(BaseSchema):
    role: ModelIdSchema
    user: ModelIdSchema
