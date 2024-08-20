from datetime import datetime
from typing import Sequence

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
    is_editable: bool
    is_deletable: bool
    is_default: bool
    fields: list["FieldSchema"]


class IncidentStatusSchema(ModelSchema):
    name: str
    description: str | None
    rank: int
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


class FieldSchema(ModelSchema):
    label: str
    description: str | None = None
    kind: str
    interface_kind: str
    available_options: list[str] | None = None
    is_editable: bool
    is_deletable: bool
    is_system: bool


class FormFieldSchema(ModelSchema):
    label: str
    description: str | None
    position: int
    is_required: bool
    is_deletable: bool
    default_value: str | None
    field: FieldSchema


class FormSchema(ModelSchema):
    name: str
    is_published: bool
    template: str | None
    type: str


class SettingsSchema(ModelSchema):
    slack_channel_name_format: str
    incident_reference_format: str

    slack_announcement_channel_name: str


class IncidentFieldValueSchema(ModelSchema):
    # field: FieldSchema
    value_text: str | None = None
    value_single_select: str | None = None
    value_multi_select: list[str] | None = None


class LifecycleSchema(ModelSchema):
    is_triage_available: bool


class OrganisationMemberSchema(ModelSchema):
    user: PublicUserSchema
    role: str


IncidentTypeSchema.model_rebuild()
