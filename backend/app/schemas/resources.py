from datetime import datetime
from typing import Any, Generic, Sequence, TypeVar

from pydantic import ConfigDict

from app.models import ComponentStatus, Organisation, User
from app.schemas.base import BaseSchema
from app.schemas.models import FormSchema, IncidentRoleSchema, OrganisationSchema, StatusPageComponentSchema, UserSchema

DataT = TypeVar("DataT")


class PaginatedResults(BaseSchema, Generic[DataT]):
    total: int
    page: int
    size: int
    items: Sequence[DataT]

    model_config = ConfigDict(arbitrary_types_allowed=True)


class OrganisationDetail(BaseSchema):
    organisation: OrganisationSchema
    forms: list[FormSchema]
    roles: list[IncidentRoleSchema]


class WorldSchema(BaseSchema):
    user: UserSchema
    organisation_details: list[OrganisationDetail]


# - misc credentials
class CreationResult(BaseSchema):
    user: User
    organisation: Organisation
    is_new_organisation: bool

    model_config = ConfigDict(arbitrary_types_allowed=True)


# - misc credentials
class OrganisationCreationResult(BaseSchema):
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


class ComponentStatusSchema(BaseSchema):
    component: StatusPageComponentSchema
    status: ComponentStatus


class ComponentsCurrentStatusSchema(BaseSchema):
    components: list[ComponentStatusSchema]
