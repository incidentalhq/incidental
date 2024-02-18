from typing import Any

import structlog

from app.env import settings
from app.models import Announcement, AnnouncementFields, Incident, IncidentRoleKind

logger = structlog.get_logger(logger_name=__name__)


class AnnouncementRenderer:
    def __init__(self, announcement: Announcement, incident: Incident):
        self.incident = incident
        self.announcement = announcement

    def render(self) -> list[dict[str, Any]]:
        divider = {
            "type": "divider",
        }
        header_section = {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f":mega: {self.incident.name}",
            },
        }
        description_section = {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "A new incident has been created",
            },
        }

        field_sections: list[dict[str, Any]] = []

        for field_name in self.announcement.fields:
            text_field = self.render_field_to_slack_field(field=field_name)
            field_sections.append(
                {
                    "type": "section",
                    "text": text_field,
                }
            )

        actions = {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Incident page"},
                    "url": f"{settings.FRONTEND_URL}/incident/{self.incident.id}",
                }
            ],
        }

        blocks: list[dict[str, Any]] = [
            header_section,
            description_section,
            divider,
        ]
        blocks.extend(field_sections)
        blocks.append(divider)
        blocks.append(actions)

        return blocks

    def render_field_to_slack_field(self, field: AnnouncementFields) -> dict[str, Any] | None:
        match field:
            case AnnouncementFields.INCIDENT_LEAD:
                lead = self.incident.get_user_for_role(IncidentRoleKind.LEAD)
                lead_label = lead.name if lead else "Not assigned"
                return {
                    "type": "mrkdwn",
                    "text": f":firefighter: *Lead*: {lead_label}\n",
                }
            case AnnouncementFields.TYPE:
                return {
                    "type": "mrkdwn",
                    "text": f":package: *Type:* {self.incident.incident_type.name}\n",
                }
            case AnnouncementFields.SEVERITY:
                return {
                    "type": "mrkdwn",
                    "text": f":zap: *Severity:* {self.incident.incident_severity.name}\n",
                }
            case AnnouncementFields.STATUS:
                return {
                    "type": "mrkdwn",
                    "text": f":traffic_light: *Status:* {self.incident.incident_status.name}\n",
                }
            case AnnouncementFields.REPORTER:
                reporter = self.incident.get_user_for_role(IncidentRoleKind.REPORTER)
                reporter_label = reporter.name if reporter else "Not assigned"
                return {
                    "type": "mrkdwn",
                    "text": f"*:man-frowning: Reporter:* {reporter_label}\n",
                }
            case AnnouncementFields.SLACK_CHANNEL:
                return {
                    "type": "mrkdwn",
                    "text": f"*:hash: Channel*: #{self.incident.slack_channel_name}",
                }

        return None
