from datetime import datetime
from typing import Sequence

from pydantic import EmailStr

from app.schemas.base import BaseSchema


class ModelSchema(BaseSchema):
    id: str
    created_at: datetime


class OrganisationSchema(ModelSchema):
    name: str
    kind: str


class UserSchema(ModelSchema):
    name: str
    email_address: EmailStr
    auth_token: str
    is_super_admin: bool
    last_login_at: datetime | None


class UserPublicSchema(ModelSchema):
    name: str
    email_address: EmailStr


class PublicUserSchema(ModelSchema):
    name: str
    email_address: str


class IncidentTypeSchema(ModelSchema):
    name: str
    description: str


class IncidentStatusSchema(ModelSchema):
    name: str
    description: str | None
    sort_order: int
    category: str


class IncidentSeveritySchema(ModelSchema):
    name: str
    description: str
    rating: int


class IncidentRoleSchema(ModelSchema):
    name: str
    kind: str


class IncidentRoleAssignmentSchema(ModelSchema):
    user: PublicUserSchema
    incident_role: IncidentRoleSchema


class IncidentSchema(ModelSchema):
    name: str
    reference: str
    slack_channel_id: str
    slack_channel_name: str
    owner: PublicUserSchema
    incident_type: IncidentTypeSchema
    incident_status: IncidentStatusSchema
    incident_severity: IncidentSeveritySchema
    incident_role_assignments: Sequence[IncidentRoleAssignmentSchema]
