from datetime import datetime
from typing import Any, Generic, Sequence, TypeVar

from pydantic import ConfigDict

from app.models import Organisation, User
from app.schemas.base import BaseSchema
from app.schemas.models import (
    FormSchema,
    IncidentSeveritySchema,
    IncidentStatusSchema,
    IncidentTypeSchema,
    OrganisationSchema,
    UserSchema,
)

DataT = TypeVar("DataT")


class PaginatedResults(BaseSchema, Generic[DataT]):
    total: int
    page: int
    size: int
    items: Sequence[DataT]

    model_config = ConfigDict(arbitrary_types_allowed=True)


class WorldSchema(BaseSchema):
    user: UserSchema
    status_list: list[IncidentStatusSchema]
    severity_list: list[IncidentSeveritySchema]
    organisations: list[OrganisationSchema]
    forms: list[FormSchema]
    incident_types: list[IncidentTypeSchema]


class CreationResult(BaseSchema):
    user: User
    organisation: Organisation
    is_new_organisation: bool

    model_config = ConfigDict(arbitrary_types_allowed=True)


class Credentials(BaseSchema):
    access_token: str
    refresh_token: str | None = None
    expires_at: datetime | None = None
    token_type: str
    id_token: str | None = None  # openid
    original_data: dict[str, Any]
