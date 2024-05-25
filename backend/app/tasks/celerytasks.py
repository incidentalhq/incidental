from app.db import session_factory
from app.schemas.tasks import (
    CreateAnnouncementTaskParameters,
    CreateIncidentUpdateParameters,
    CreatePinnedMessageTaskParameters,
    HandleSlashCommandTaskParameters,
    InviteUserToChannelParams,
    JoinChannelTaskParameters,
    SetChannelTopicParameters,
    SyncBookmarksTaskParameters,
)
from app.tasks import (
    CreateAnnouncementTask,
    CreateIncidentUpdateTask,
    CreatePinnedMessageTask,
    HandleSlashCommandTask,
    InviteUserToChannelTask,
    JoinChannelTask,
    SetChannelTopicTask,
    SyncBookmarksTask,
)
from app.worker import celery


@celery.task()
def create_announcement(params: CreateAnnouncementTaskParameters):
    with session_factory() as session:
        task = CreateAnnouncementTask(session=session)
        task.execute(parameters=params)


@celery.task()
def join_channel(params: JoinChannelTaskParameters):
    with session_factory() as session:
        JoinChannelTask(session=session).execute(parameters=params)


@celery.task()
def invite_user_to_channel(params: InviteUserToChannelParams):
    with session_factory() as session:
        InviteUserToChannelTask(session=session).execute(parameters=params)


@celery.task()
def set_channel_topic(params: SetChannelTopicParameters):
    with session_factory() as session:
        SetChannelTopicTask(session=session).execute(parameters=params)


@celery.task
def handle_slash_command(params: HandleSlashCommandTaskParameters):
    with session_factory() as session:
        HandleSlashCommandTask(session=session).execute(parameters=params)


@celery.task
def create_incident_update(params: CreateIncidentUpdateParameters):
    with session_factory() as session:
        CreateIncidentUpdateTask(session=session).execute(parameters=params)


@celery.task
def create_pinned_message(params: CreatePinnedMessageTaskParameters):
    with session_factory() as session:
        CreatePinnedMessageTask(session=session).execute(parameters=params)


@celery.task
def sync_bookmarks(params: SyncBookmarksTaskParameters):
    with session_factory() as session:
        SyncBookmarksTask(session=session).execute(parameters=params)
