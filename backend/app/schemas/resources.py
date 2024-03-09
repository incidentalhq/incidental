from typing import Generic, Sequence, TypeVar

from pydantic import ConfigDict

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
