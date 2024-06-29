from pydantic import BaseModel

from app.schemas.slack import (
    SlackCommandDataSchema,
)


class CreateAnnouncementTaskParameters(BaseModel):
    incident_id: str


class HandleSlashCommandTaskParameters(BaseModel):
    command: SlackCommandDataSchema


class CreateIncidentUpdateParameters(BaseModel):
    incident_id: str
    incident_update_id: str
    creator_id: str


class CreatePinnedMessageTaskParameters(BaseModel):
    incident_id: str


class InviteUserToChannelParams(BaseModel):
    user_id: str
    organisation_id: str
    slack_channel_id: str


class JoinChannelTaskParameters(BaseModel):
    organisation_id: str
    slack_channel_id: str


class SetChannelTopicParameters(BaseModel):
    organisation_id: str
    topic: str
    slack_channel_id: str


class SyncBookmarksTaskParameters(BaseModel):
    incident_id: str


class IncidentDeclaredTaskParameters(BaseModel):
    incident_id: str


class IncidentStatusUpdatedTaskParameters(BaseModel):
    incident_id: str
    new_status_id: str
    old_status_id: str


class CreateSlackMessageTaskParameters(BaseModel):
    organisation_id: str
    channel_id: str
    message: str
    text: str | None = None
