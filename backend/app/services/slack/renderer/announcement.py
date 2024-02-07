from typing import Any

import structlog

from app.models import Announcement, AnnouncementFields, Incident, IncidentRoleKind

logger = structlog.get_logger(logger_name=__name__)


class AnnouncementRenderer:

    def __init__(self, announcement: Announcement, incident: Incident):
        self.incident = incident
        self.announcement = announcement

    def render(self) -> list[dict[str, Any]]:
        header_section = {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": self.incident.name,
            },
        }
        description_section = {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": ":mega: A new incident has been created",
            },
        }

        fields_section: dict[str, Any] = {
            "type": "section",
            "fields": [],
        }

        for field_name in self.announcement.fields:
            fields_section["fields"].append(self.render_field_to_slack_field(field=field_name))

        blocks = [
            header_section,
            description_section,
            fields_section,
        ]

        return blocks

    def render_field_to_slack_field(self, field: AnnouncementFields) -> dict[str, Any] | None:
        match field:
            case AnnouncementFields.INCIDENT_LEAD:
                lead = self.incident.get_user_for_role(IncidentRoleKind.LEAD)
                lead_label = lead.name if lead else "Not assigned"
                return {
                    "type": "mrkdwn",
                    "text": f":firefighter: *Lead*:\n {lead_label}\n",
                }
            case AnnouncementFields.TYPE:
                return {
                    "type": "mrkdwn",
                    "text": f":traffic_light: *Type:*\n {self.incident.incident_type.name}\n",
                }
            case AnnouncementFields.SEVERITY:
                return {
                    "type": "mrkdwn",
                    "text": f":zap: *Severity:*\n {self.incident.incident_severity.name}\n",
                }
            case AnnouncementFields.STATUS:
                return {
                    "type": "mrkdwn",
                    "text": f":compass: *Status:*\n {self.incident.incident_status.name}\n",
                }
            case AnnouncementFields.REPORTER:
                reporter = self.incident.get_user_for_role(IncidentRoleKind.REPORTER)
                reporter_label = reporter.name if reporter else "Not assigned"
                return {
                    "type": "mrkdwn",
                    "text": f"*Reporter:*\n {reporter_label}\n",
                }

        return None
