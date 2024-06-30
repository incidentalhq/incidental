from datetime import datetime
from typing import Any, Sequence

from pydantic import EmailStr

from app.schemas.base import BaseSchema


class ModelIdSchema(BaseSchema):
    id: str


class ModelSchema(ModelIdSchema):
    created_at: datetime


class OrganisationSchema(ModelSchema):
    slug: str
    name: str
    kind: str
    slack_team_id: str | None
    slack_team_name: str | None
    slack_app_installed: bool


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
    description: str
    guide: str | None
    slack_reference: str
    is_deletable: bool
    is_editable: bool


class IncidentRoleAssignmentSchema(ModelSchema):
    user: PublicUserSchema
    incident_role: IncidentRoleSchema


class TimestampRuleSchema(BaseSchema):
    first: bool = False
    last: bool = False
    on_event: str


class TimestampSchema(ModelSchema):
    label: str
    kind: str
    rank: int
    rules: list[TimestampRuleSchema]
    can_delete: bool


class TimestampValueSchema(ModelSchema):
    timestamp: TimestampSchema
    value: datetime | None


class IncidentSchema(ModelSchema):
    name: str
    description: str | None
    reference: str
    slack_channel_id: str
    slack_channel_name: str
    creator: PublicUserSchema
    incident_type: IncidentTypeSchema
    incident_status: IncidentStatusSchema
    incident_severity: IncidentSeveritySchema
    incident_role_assignments: Sequence[IncidentRoleAssignmentSchema]
    timestamp_values: list[TimestampValueSchema]


class IncidentUpdateSchema(ModelSchema):
    creator: PublicUserSchema
    summary: str | None
    new_incident_status: IncidentStatusSchema | None
    previous_incident_status: IncidentStatusSchema | None
    new_incident_severity: IncidentSeveritySchema | None
    previous_incident_severity: IncidentSeveritySchema | None


class FormFieldSchema(ModelSchema):
    kind: str
    label: str
    name: str
    description: str | None
    position: int
    is_required: bool
    is_deletable: bool
    default_value: str | None


class FormSchema(ModelSchema):
    name: str
    is_published: bool
    template: str | None
    type: str
    form_fields: list[FormFieldSchema]


class SettingsSchema(ModelSchema):
    slack_channel_name_format: str
    incident_reference_format: str

    slack_announcement_channel_name: str
