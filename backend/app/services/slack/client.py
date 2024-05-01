from datetime import datetime, timezone
from typing import Any, Callable, Tuple

import structlog
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from sqlalchemy.orm import Session

from app.env import settings
from app.exceptions import ErrorCodes, ExternalApiError
from app.models import Announcement, Incident, IncidentRoleKind, IncidentUpdate, Organisation, SlackMessage, User
from app.models.slack_bookmark import SlackBookmarkKind
from app.models.slack_message import SlackMessageKind
from app.repos import SlackBookmarkRepo, SlackMessageRepo
from app.services.slack.renderer import AnnouncementRenderer, IncidentInformationMessageRenderer, IncidentUpdateRenderer
from app.utils import to_channel_name

logger = structlog.get_logger(logger_name=__name__)


class LeadNotAssignedError(ValueError):
    pass


class SlackClientService:
    def __init__(self, auth_token: str, session: Session):
        self.auth_token = auth_token
        self.client = WebClient(token=auth_token)
        self.slack_message_repo = SlackMessageRepo(session=session)
        self.slack_bookmark_repo = SlackBookmarkRepo(session=session)

    def _generate_slack_channel_name(self, organisation: Organisation, incident_name: str) -> str:
        now = datetime.now(tz=timezone.utc)
        mappings = {
            "{YYYY}": now.strftime("%Y"),
            "{MM}": now.strftime("%m"),
            "{DD}": now.strftime("%d"),
        }
        channel_name = organisation.settings.slack_channel_name_format

        for t, value in mappings.items():
            channel_name = channel_name.replace(t, value)

        suffix = to_channel_name(incident_name)
        channel_name = f"{channel_name}-{suffix}"

        conversation_list_response = self.client.conversations_list(types=["private_channel", "public_channel"])
        used_names: set[str] = set()

        for channel_data in conversation_list_response.get("channels", []):  # type: ignore
            used_names.add(channel_data["name"])

        # generate a name that doesn't clash with an existing one
        idx = 1
        channel_name_candidate = channel_name
        while True:
            if channel_name_candidate in used_names:
                channel_name_candidate = f"{channel_name}-{idx}"
                idx += 1
            else:
                break

        return channel_name_candidate

    def create_incident_channel(self, organisation: Organisation, name: str) -> Tuple[str, str]:
        """Create a new channel for the incident"""
        channel_name = self._generate_slack_channel_name(organisation=organisation, incident_name=name)
        response = self.client.conversations_create(name=channel_name, team_id=organisation.slack_team_id)
        slack_channel_id = response.get("channel", {}).get("id", None)  # type: ignore
        return slack_channel_id, channel_name

    def create_channel_if_not_exists(self, channel_name: str) -> str:
        conversation_list_response = self.client.conversations_list(types=["private_channel", "public_channel"])
        channels: dict[str, str] = dict()

        for channel_data in conversation_list_response.get("channels", []):  # type: ignore
            channels[channel_data["name"]] = channel_data["id"]

        if channel_name in channels:
            return channels[channel_name]

        # create new channel, or use existing one
        channel_create_response = self.client.conversations_create(name=channel_name)
        channel_id = channel_create_response.get("channel", dict()).get("id")  # type: ignore
        return channel_id

    def join_incident_channel(self, incident: Incident) -> None:
        """Put application into incident channel"""
        self.client.conversations_join(channel=incident.slack_channel_id)

    def join_announcements_channel(self, incident: Incident) -> None:
        """Put application into announcements channel"""
        self.client.conversations_join(channel=incident.organisation.settings.slack_announcement_channel_id)

    def post_announcement(self, channel_id: str, announcement: Announcement, incident: Incident) -> SlackMessage:
        renderer = AnnouncementRenderer(announcement=announcement, incident=incident)
        blocks = renderer.render()

        posted_message_response = self.client.chat_postMessage(channel=channel_id, blocks=blocks)

        slack_message = self.slack_message_repo.create_slack_message(
            organisation=incident.organisation,
            response=posted_message_response.data,
            kind=SlackMessageKind.ANNOUNCEMENT_POST,
            announcement=announcement,
        )

        return slack_message

    def create_incident_update(
        self, creator: User, incident: Incident, incident_update: IncidentUpdate
    ) -> SlackMessage | None:
        renderer = IncidentUpdateRenderer(
            creator=creator,
            summary=incident_update.summary,
            incident_update=incident_update,
        )
        blocks = renderer.render()

        try:
            posted_message_response = self.client.chat_postMessage(channel=incident.slack_channel_id, blocks=blocks)
            return self.slack_message_repo.create_slack_message(
                organisation=incident.organisation,
                response=posted_message_response.data,
                kind=SlackMessageKind.INCIDENT_UPDATE,
            )
        except SlackApiError as e:
            if e.response.get("error") == "is_archived":
                return None
            else:
                raise

    def create_pinned_message(self, incident: Incident):
        renderer = IncidentInformationMessageRenderer(incident=incident)
        blocks = renderer.render()

        response = self.client.chat_postMessage(
            channel=incident.slack_channel_id,
            blocks=blocks,
        )

        # ping message
        self.client.pins_add(channel=incident.slack_channel_id, timestamp=response.get("ts"))
        self.slack_message_repo.create_slack_message(
            organisation=incident.organisation, response=response.data, kind=SlackMessageKind.CHANNEL_PINNED_POST
        )

    def set_incident_channel_topic(self, incident: Incident):
        self.client.conversations_setTopic(channel=incident.slack_channel_id, topic=incident.reference)

    def set_incident_channel_bookmarks(self, incident: Incident):
        """Update bookmarks for a incident channel"""

        incident_url = f"{settings.FRONTEND_URL}/incident/{incident.id}"
        status_url = f"{settings.FRONTEND_URL}/incident/{incident.id}"
        sev_url = f"{settings.FRONTEND_URL}/incident/{incident.id}"
        lead = incident.get_user_for_role(IncidentRoleKind.LEAD)

        def render_lead(incident: Incident) -> dict[str, str]:
            if not lead:
                raise LeadNotAssignedError("No lead assigned to this incident")

            lead_url = f"{settings.FRONTEND_URL}/incident/{incident.id}"
            return {
                "title": f"Lead: {lead.name}",
                "link": lead_url,
                "emoji": ":firefighter:",
                "type": "link",
            }

        bookmark_descriptors: dict[SlackBookmarkKind, Callable[[Incident], dict[str, str]]] = {
            SlackBookmarkKind.HOMEPAGE: lambda i: {
                "title": "Homepage",
                "link": incident_url,
                "emoji": ":house:",
                "type": "link",
            },
            SlackBookmarkKind.SEVERITY: lambda i: {
                "title": f"Severity: {incident.incident_severity.name}",
                "link": sev_url,
                "emoji": ":zap:",
                "type": "link",
            },
            SlackBookmarkKind.STATUS: lambda i: {
                "title": f"Status: {incident.incident_status.name}",
                "link": status_url,
                "emoji": ":traffic_light:",
                "type": "link",
            },
            SlackBookmarkKind.LEAD: render_lead,
        }

        current_bookmarks = self.slack_bookmark_repo.get_all_for_channel(slack_channel_id=incident.slack_channel_id)
        current_bookmarks_map = {bookmark.kind: bookmark for bookmark in current_bookmarks}

        # depending on whether bookmark exists on slack or not, we will update or create it
        for bookmark_kind in list(bookmark_descriptors.keys()):
            try:
                bookmark_data = bookmark_descriptors[bookmark_kind](incident)
            # if lead not assigned, don't create this bookmark
            except LeadNotAssignedError:
                continue

            # update bookmark if it already exists
            if bookmark_kind in current_bookmarks_map.keys():
                bookmark = current_bookmarks_map[bookmark_kind]
                self.client.bookmarks_edit(
                    bookmark_id=bookmark.slack_bookmark_id,
                    channel_id=incident.slack_channel_id,
                    title=bookmark_data["title"],
                )
            # create new bookmark
            else:
                bookmark_add_response = self.client.bookmarks_add(
                    channel_id=incident.slack_channel_id,
                    title=bookmark_data["title"],
                    type=bookmark_kind,
                    emoji=bookmark_data["emoji"],
                    link=bookmark_data["link"],
                )
                slack_bookmark_data: dict[str, Any] | None = bookmark_add_response.get("bookmark")
                if not slack_bookmark_data:
                    logger.error("Bookmark data not found in response", response=bookmark_add_response.data)
                    raise ExternalApiError("Bookmark data not found in response", code=ErrorCodes.SLACK_API_ERROR)

                slack_bookmark_id: str | None = slack_bookmark_data.get("id")
                if not slack_bookmark_id:
                    raise ExternalApiError("ID not found in bookmark data", code=ErrorCodes.SLACK_API_ERROR)

                self.slack_bookmark_repo.create_bookmark(
                    incident=incident, bookmark_id=slack_bookmark_id, kind=bookmark_kind
                )

    def invite_user_to_incident_channel(self, incident: Incident, user: User):
        self.client.conversations_invite(channel=incident.slack_channel_id, users=[user.slack_user_id])

    def invite_user_to_announcements_channel(self, organisation: Organisation, user: User):
        # app must be in announcements channel
        try:
            self.client.conversations_join(channel=organisation.settings.slack_announcement_channel_id)
        except SlackApiError:
            raise

        # then invite creator of incident to the announcements channel
        try:
            self.client.conversations_invite(
                channel=organisation.settings.slack_announcement_channel_id, users=[user.slack_user_id]
            )
        except SlackApiError as e:
            if e.response.get("error") == "already_in_channel":
                pass
            else:
                raise
