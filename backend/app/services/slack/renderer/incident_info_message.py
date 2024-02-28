from typing import Any

import structlog

from app.models import Incident

logger = structlog.get_logger(logger_name=__name__)


class IncidentInformationMessageRenderer:
    def __init__(self, incident: Incident):
        self.incident = incident

    def render(self) -> list[dict[str, Any]]:
        divider = {
            "type": "divider",
        }
        header_section = {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f":rotating_light: {self.incident.name} :rotating_light:",
            },
        }
        description_section = {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": self.incident.description if self.incident.description else "No summary set.",
            },
        }
        blocks: list[dict[str, Any]] = [
            header_section,
            description_section,
            divider,
        ]

        return blocks
