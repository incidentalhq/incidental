from datetime import datetime
from typing import Sequence

from pydantic import EmailStr

from app.models.status_page import ComponentStatus, StatusPageIncidentStatus, StatusPageKind
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
    rank: int
    requirement_type: str
    is_deletable: bool
    default_value: str | None
    default_value_multi: list[str] | None
    field: FieldSchema
    can_have_default_value: bool
    can_have_description: bool
    can_change_requirement_type: bool


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


# -- Status Page --


class StatusPageComponentSchema(ModelSchema):
    name: str


class StatusPageComponentGroupSchema(ModelSchema):
    name: str


class StatusPageItemSchema(ModelSchema):
    rank: int

    status_page_component: StatusPageComponentSchema | None = None
    status_page_component_group: StatusPageComponentGroupSchema | None = None
    status_page_items: list["StatusPageItemSchema"] = []


class StatusPageSchema(ModelSchema):
    organisation_id: str
    name: str
    page_type: StatusPageKind
    custom_domain: str | None
    published_at: datetime | None
    public_url: str
    slug: str
    has_active_incident: bool

    status_page_items: list[StatusPageItemSchema]


class RelatedStatusPageIncidentSchema(ModelSchema):
    name: str


class StatusPageComponentEventSchema(ModelSchema):
    status_page_component: StatusPageComponentSchema
    status_page_incident: RelatedStatusPageIncidentSchema
    status: ComponentStatus
    started_at: datetime
    ended_at: datetime | None


class StatusPageWithEventsSchema(BaseSchema):
    status_page: StatusPageSchema
    events: list[StatusPageComponentEventSchema]
    uptimes: dict[str, float]
    incidents: list["StatusPageIncidentSchema"]


class StatusPageComponentAffectedSchema(ModelSchema):
    status_page_component: StatusPageComponentSchema
    status: ComponentStatus


class StatusPageComponentUpdateSchema(ModelSchema):
    status_page_component: StatusPageComponentSchema
    status: ComponentStatus


class StatusPageIncidentUpdateSchema(ModelSchema):
    message: str
    published_at: datetime
    creator: UserPublicSchema
    status: StatusPageIncidentStatus
    component_updates: list[StatusPageComponentUpdateSchema]


class RelatedStatePageSchema(ModelSchema):
    name: str


class StatusPageIncidentSchema(ModelSchema):
    name: str
    published_at: datetime
    status: StatusPageIncidentStatus
    creator: UserPublicSchema
    incident_updates: list[StatusPageIncidentUpdateSchema]
    status_page: RelatedStatePageSchema
    components_affected: list[StatusPageComponentAffectedSchema]


class StatusPageDomainStatusCheckResponse(BaseSchema):
    is_verified: bool


class InviteSchema(ModelSchema):
    email_address: str
    role: str


IncidentTypeSchema.model_rebuild()
StatusPageComponentGroupSchema.model_rebuild()
StatusPageWithEventsSchema.model_rebuild()
