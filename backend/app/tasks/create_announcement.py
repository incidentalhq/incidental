import structlog
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from app.models.slack_message import SlackMessageKind
from app.repos import AnnouncementRepo, IncidentRepo, SlackMessageRepo
from app.schemas.tasks import CreateAnnouncementTaskParameters
from app.services.slack.renderer import AnnouncementRenderer

from .base import BaseTask

logger = structlog.getLogger(logger_name=__name__)


class CreateAnnouncementTask(BaseTask["CreateAnnouncementTaskParameters"]):
    def execute(self, parameters: "CreateAnnouncementTaskParameters"):
        announcement_repo = AnnouncementRepo(session=self.session)
        incident_repo = IncidentRepo(session=self.session)
        slack_message_repo = SlackMessageRepo(session=self.session)

        incident = incident_repo.get_incident_by_id(parameters.incident_id)
        if not incident:
            raise Exception("could not find incident")

        announcement = announcement_repo.get_announcement(incident.organisation)
        if not announcement:
            raise Exception("announcement not setup for organisation")

        client = WebClient(token=incident.organisation.slack_bot_token)

        # create channel first
        channel_id = self.create_channel_if_not_exists(
            client=client, channel_name=incident.organisation.settings.slack_announcement_channel_name
        )
        # update channel id
        if channel_id != incident.organisation.settings.slack_announcement_channel_id:
            incident.organisation.settings.slack_announcement_channel_id = channel_id
            logger.info("Updated announcement channel id", channel_id=channel_id)

        # app should join the announcements channel
        client.conversations_join(channel=channel_id)

        # invite creator of incident to the announcement channel if they're not already in there
        try:
            client.conversations_invite(channel=channel_id, users=[incident.creator.slack_user_id])
        except SlackApiError as e:
            if e.response.get("error") == "already_in_channel":
                logger.warning("user is already in channel")
            else:
                raise

        # render message
        renderer = AnnouncementRenderer(announcement=announcement, incident=incident)
        blocks = renderer.render()

        # post the announcement
        logger.info("posting announcement", channel_name=incident.organisation.settings.slack_announcement_channel_name)
        posted_message_response = client.chat_postMessage(
            channel=channel_id, blocks=blocks, text="A new incident has been declared"
        )
        slack_message = slack_message_repo.create_slack_message(
            organisation=incident.organisation,
            response=posted_message_response.data,  # type: ignore
            kind=SlackMessageKind.ANNOUNCEMENT_POST,
            announcement=announcement,
        )

        self.session.commit()

        return slack_message

    def create_channel_if_not_exists(self, client: WebClient, channel_name: str) -> str:
        conversation_list_response = client.conversations_list(types=["private_channel", "public_channel"])
        channels: dict[str, str] = dict()

        for channel_data in conversation_list_response.get("channels", []):  # type: ignore
            channels[channel_data["name"]] = channel_data["id"]

        if channel_name in channels:
            return channels[channel_name]

        # create new channel, or use existing one
        logger.info("Creating new announcements channel", channel_name=channel_name)
        channel_create_response = client.conversations_create(name=channel_name)
        channel_id = channel_create_response.get("channel", dict()).get("id")  # type: ignore
        return channel_id
