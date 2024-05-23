from typing import ClassVar, Type

import structlog
from pydantic import BaseModel
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from app.repos import OrganisationRepo, UserRepo

from .base import BaseTask

logger = structlog.get_logger(logger_name=__name__)


class InviteUserToChannel(BaseTask["InviteUserToChannelParams"]):
    def execute(self, parameters: "InviteUserToChannelParams"):
        user_repo = UserRepo(session=self.session)
        organisation_repo = OrganisationRepo(session=self.session)

        user = user_repo.get_by_id_or_raise(parameters.user_id)
        organisation = organisation_repo.get_by_id_or_raise(parameters.organisation_id)

        client = WebClient(token=organisation.slack_bot_token)

        # app must be in announcements channel
        try:
            client.conversations_join(channel=parameters.slack_channel_id)
        except SlackApiError:
            raise

        # then invite creator of incident to the announcements channel
        try:
            client.conversations_invite(channel=parameters.slack_channel_id, users=[user.slack_user_id])
        except SlackApiError as e:
            if e.response.get("error") == "already_in_channel":
                logger.warning("user is already in channel")
            else:
                raise


class InviteUserToChannelParams(BaseModel):
    task: ClassVar[Type[InviteUserToChannel]] = InviteUserToChannel
    user_id: str
    organisation_id: str
    slack_channel_id: str
