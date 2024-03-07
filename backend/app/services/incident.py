from datetime import datetime, timezone

import structlog
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from app.env import settings
from app.models import Incident, IncidentRoleKind, IncidentSeverity, IncidentStatus, IncidentType, Organisation, User
from app.repos import AnnouncementRepo, IncidentRepo
from app.schemas.actions import PatchIncidentSchema
from app.services.slack.renderer import AnnouncementRenderer, IncidentInformationMessageRenderer, IncidentUpdateRenderer
from app.utils import to_channel_name

logger = structlog.get_logger(logger_name=__name__)


class IncidentService:
    def __init__(
        self,
        organisation: Organisation,
        incident_repo: IncidentRepo,
        announcement_repo: AnnouncementRepo,
    ):
        self.organisation = organisation
        self.incident_repo = incident_repo
        self.slack_client = WebClient(token=organisation.slack_bot_token)
        self.announcement_repo = announcement_repo

    def generate_slack_channel_name(self, incident_name: str) -> str:
        now = datetime.now(tz=timezone.utc)
        mappings = {
            "{YYYY}": now.strftime("%Y"),
            "{MM}": now.strftime("%m"),
            "{DD}": now.strftime("%d"),
        }
        channel_name = self.organisation.settings.slack_channel_name_format

        for t, value in mappings.items():
            channel_name = channel_name.replace(t, value)

        suffix = to_channel_name(incident_name)
        channel_name = f"{channel_name}-{suffix}"

        conversation_list_response = self.slack_client.conversations_list(types=["private_channel", "public_channel"])
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

    def generate_incident_reference(self) -> str:
        total_incidents = self.incident_repo.get_total_incidents(organisation=self.organisation)
        mappings = {
            "{id}": str(total_incidents + 1),
        }
        reference = self.organisation.settings.incident_reference_format

        for t, value in mappings.items():
            reference = reference.replace(t, value)

        return reference

    def create_incident(
        self,
        name: str,
        summary: str,
        creator: User,
        incident_severity: IncidentSeverity,
        incident_type: IncidentType,
    ):
        # FIXME: this should not be hardcoded
        status_name = "Triage"
        status = self.incident_repo.get_incident_status_by_name(organisation=self.organisation, name=status_name)
        if not status:
            raise Exception(f"Could not find status: {status_name}")

        reference = self.generate_incident_reference()
        channel_name = self.generate_slack_channel_name(name)
        logger.info("Creating channel", name=channel_name)

        # create the channel in slack
        response = self.slack_client.conversations_create(name=channel_name, team_id=self.organisation.slack_team_id)
        slack_channel_id = response.get("channel", {}).get("id", None)  # type: ignore

        # invite the reporter to the channel
        self.slack_client.conversations_invite(channel=slack_channel_id, users=[creator.slack_user_id])

        # finally create the incident
        incident = self.incident_repo.create_incident(
            organisation=self.organisation,
            user=creator,
            name=name,
            summary=summary,
            status=status,
            severity=incident_severity,
            type=incident_type,
            reference=reference,
            slack_channel_id=slack_channel_id,
            slack_channel_name=channel_name,
        )

        # create an announcement in the #incidents channel
        self.create_announcement(incident)

        self.set_topic(incident)

        # pin a message into the channel
        self.pin_message(incident)

        # add bookmarks
        self.add_bookmarks(incident)

        return incident

    def create_announcement(self, incident: Incident):
        conversation_list_response = self.slack_client.conversations_list(types=["private_channel", "public_channel"])
        channels: dict[str, str] = dict()

        for channel_data in conversation_list_response.get("channels", []):  # type: ignore
            channels[channel_data["name"]] = channel_data["id"]

        incident_channel_name = incident.organisation.settings.slack_announcement_channel_name
        channel_id: None | str = None

        # find channel_id
        if incident_channel_name in channels:
            channel_id = channels[incident_channel_name]

        # create new channel, or use existing one
        if not channel_id:
            channel_create_response = self.slack_client.conversations_create(name=incident_channel_name)
            channel_id = channel_create_response.get("channel", dict()).get("id")  # type: ignore

        if not channel_id:
            raise Exception("Could not find channel_id")

        incident.organisation.settings.slack_announcement_channel_id = channel_id

        # get announcement
        announcement = self.announcement_repo.get_announcement(organisation=incident.organisation)
        if not announcement:
            raise Exception("Could not find announcement")

        renderer = AnnouncementRenderer(announcement=announcement, incident=incident)
        blocks = renderer.render()

        self.slack_client.chat_postMessage(channel=channel_id, blocks=blocks)

    def create_update(
        self,
        incident: Incident,
        creator: User,
        new_status: IncidentStatus | None = None,
        new_severity: IncidentSeverity | None = None,
        summary: str | None = None,
    ):
        renderer = IncidentUpdateRenderer(
            creator=creator, incident=incident, new_severity=new_severity, new_status=new_status, summary=summary
        )
        blocks = renderer.render()

        self.incident_repo.create_incident_update(
            incident=incident,
            creator=creator,
            new_status=new_status,
            new_severity=new_severity,
            summary=summary,
        )

        try:
            self.slack_client.chat_postMessage(channel=incident.slack_channel_id, blocks=blocks)
        except SlackApiError as e:
            if e.response.get("error") == "is_archived":
                pass
            else:
                raise

    def pin_message(self, incident: Incident) -> None:
        renderer = IncidentInformationMessageRenderer(incident=incident)
        blocks = renderer.render()

        message = self.slack_client.chat_postMessage(
            channel=incident.slack_channel_id,
            blocks=blocks,
        )

        # ping message
        self.slack_client.pins_add(channel=incident.slack_channel_id, timestamp=message.get("ts"))

    def set_topic(self, incident: Incident):
        self.slack_client.conversations_setTopic(channel=incident.slack_channel_id, topic=incident.reference)

    def add_bookmarks(self, incident: Incident):
        """Add channel bookmarks"""

        incident_url = f"{settings.FRONTEND_URL}/incident/{incident.id}"
        self.slack_client.bookmarks_add(
            channel_id=incident.slack_channel_id, title="Homepage", link=incident_url, emoji=":house:", type="link"
        )

        status_url = f"{settings.FRONTEND_URL}/incident/{incident.id}"
        self.slack_client.bookmarks_add(
            channel_id=incident.slack_channel_id,
            title=f"Status: {incident.incident_status.name}",
            link=status_url,
            emoji=":traffic_light:",
            type="link",
        )

        sev_url = f"{settings.FRONTEND_URL}/incident/{incident.id}"
        self.slack_client.bookmarks_add(
            channel_id=incident.slack_channel_id,
            title=f"Severity: {incident.incident_severity.name}",
            link=sev_url,
            emoji=":zap:",
            type="link",
        )

        lead = incident.get_user_for_role(IncidentRoleKind.LEAD)
        if lead:
            lead_url = f"{settings.FRONTEND_URL}/incident/{incident.id}"
            self.slack_client.bookmarks_add(
                channel_id=incident.slack_channel_id,
                title=f"Lead: {lead.name}",
                link=lead_url,
                emoji=":firefighter:",
                type="link",
            )

    def patch_incident(self, user: User, incident: Incident, patch_in: PatchIncidentSchema):
        new_status = None
        new_sev = None

        if patch_in.incident_status and patch_in.incident_status.id != incident.incident_status_id:
            new_status = self.incident_repo.get_incident_status_by_id(patch_in.incident_status.id)

        if patch_in.incident_severity and patch_in.incident_severity.id != incident.incident_severity_id:
            new_sev = self.incident_repo.get_incident_severity_by_id(patch_in.incident_severity.id)

        if new_sev or new_status:
            self.create_update(
                incident=incident,
                creator=user,
                new_severity=new_sev,
                new_status=new_status,
            )

        self.incident_repo.patch_incident(incident=incident, patch_in=patch_in)
