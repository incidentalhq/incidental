from typing import Any

import structlog

from app.models import IncidentUpdate, User

logger = structlog.get_logger(logger_name=__name__)


class IncidentUpdateRenderer:
    def __init__(
        self,
        creator: User,
        incident_update: IncidentUpdate,
        summary: str | None = None,
    ):
        self.creator = creator
        self.incident = incident_update
        self.summary = summary
        self.incident_update = incident_update

    def render(self) -> list[dict[str, Any]]:
        blocks: list[dict[str, Any]] = [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "Incident updated"},
            }
        ]

        if self.incident_update.new_incident_status:
            blocks.append(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"Status: {self.incident_update.previous_incident_status.name} -> {self.incident_update.new_incident_status.name}",
                    },
                }
            )
        if self.incident_update.new_incident_severity:
            blocks.append(
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"Severity: {self.incident_update.previous_incident_severity.name} -> {self.incident_update.new_incident_severity.name}",
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
