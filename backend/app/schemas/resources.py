from typing import Generic, Sequence, TypeVar

from app.schemas.base import BaseSchema
from app.schemas.models import IncidentSeveritySchema, IncidentStatusSchema, UserSchema

DataT = TypeVar("DataT")


class PaginatedResults(BaseSchema, Generic[DataT]):
    total: int
    page: int
    size: int
    items: Sequence[DataT]

    class Config:
        arbitrary_types_allowed = True


class WorldSchema(BaseSchema):
    user: UserSchema
    status_list: list[IncidentStatusSchema]
    severity_list: list[IncidentSeveritySchema]
