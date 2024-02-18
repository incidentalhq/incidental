from datetime import datetime, timezone

import structlog
from slack_sdk import WebClient

from app.models import (
    Incident,
    IncidentSeverity,
    IncidentStatus,
    IncidentType,
    Organisation,
    User,
)
from app.repos import AnnouncementRepo, IncidentRepo
from app.services.slack.renderer.announcement import AnnouncementRenderer
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
            status=status,
            severity=incident_severity,
            type=incident_type,
            reference=reference,
            slack_channel_id=slack_channel_id,
            slack_channel_name=channel_name,
        )

        self.create_announcement(incident)

        return incident

    def create_announcement(self, incident: Incident):
        conversation_list_response = self.slack_client.conversations_list(types=["private_channel", "public_channel"])
        channels: dict[str, str] = dict()

        logger.info("Creating announcement", r=conversation_list_response.data)

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
        blocks = [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "Incident updated"},
            }
        ]

        if new_status.id != incident.incident_status.id:
            blocks.append(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"Status: {incident.incident_status.name} -> {new_status.name}",
                    },
                }
            )
        if new_severity.id != incident.incident_severity.id:
            blocks.append(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"Severity: {incident.incident_severity.name} -> {new_severity.name}",
                    },
                }
            )
        if summary is not None:
            blocks.append(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": summary,
                    },
                }
            )

        blocks.append(
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": f":bust_in_silhouette: Updated by <@{creator.slack_user_id}>",
                    }
                ],
            }
        )

        self.incident_repo.create_incident_update(
            incident=incident,
            creator=creator,
            new_status=new_status,
            new_severity=new_severity,
            summary=summary,
        )

        self.slack_client.chat_postMessage(channel=incident.slack_channel_id, blocks=blocks)
