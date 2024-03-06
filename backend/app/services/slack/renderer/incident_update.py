from typing import Any

import structlog

from app.models import Incident, IncidentSeverity, IncidentStatus, User

logger = structlog.get_logger(logger_name=__name__)


class IncidentUpdateRenderer:
    def __init__(
        self,
        creator: User,
        incident: Incident,
        new_status: IncidentStatus | None = None,
        new_severity: IncidentSeverity | None = None,
        summary: str | None = None,
    ):
        self.creator = creator
        self.incident = incident
        self.new_status = new_status
        self.new_severity = new_severity
        self.summary = summary

    def render(self) -> list[dict[str, Any]]:
        blocks: list[dict[str, Any]] = [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "Incident updated"},
            }
        ]

        if self.new_status and self.new_status.id != self.incident.incident_status.id:
            blocks.append(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"Status: {self.incident.incident_status.name} -> {self.new_status.name}",
                    },
                }
            )
        if self.new_severity and self.new_severity.id != self.incident.incident_severity.id:
            blocks.append(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"Severity: {self.incident.incident_severity.name} -> {self.new_severity.name}",
                    },
                }
            )
        if self.summary is not None:
            blocks.append(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": self.summary,
                    },
                }
            )

        blocks.append(
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": f":bust_in_silhouette: Updated by <@{self.creator.slack_user_id}>",
                    }
                ],
            }
        )

        return blocks
