from enum import Enum

from pydantic import BaseModel


class Topics(str, Enum):
    INCIDENT_MODEL_CREATED = "incident.model_created"
    INCIDENT_ROLE_ASSIGNED = "incident.role_assigned"
    INCIDENT_SLACK_CHANNEL_CREATED = "incident.slack_channel_created"
    INCIDENT_UPDATE_MODEL_CREATED = "incident_update.model_created"


class BaseEvent(BaseModel):
    _topic: Topics


class IncidentModelCreated(BaseEvent):
    _topic: Topics = Topics.INCIDENT_MODEL_CREATED
    incident_id: str


class IncidentRoleAssigned(BaseEvent):
    _topic: Topics = Topics.INCIDENT_ROLE_ASSIGNED
    incident_id: str
    role_id: str
    user_id: str


class IncidentUpdateModelCreated(BaseEvent):
    _topic: Topics = Topics.INCIDENT_UPDATE_MODEL_CREATED
    incident_update_id: str
