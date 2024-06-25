from datetime import datetime, timezone
from typing import Tuple

import structlog
from slack_sdk import WebClient

from app.models import Organisation
from app.utils import to_channel_name

logger = structlog.get_logger(logger_name=__name__)


class SlackClientService:
    def __init__(self, auth_token: str):
        self.auth_token = auth_token
        self.client = WebClient(token=auth_token)

    def _generate_slack_channel_name(self, organisation: Organisation, incident_name: str) -> str:
        now = datetime.now(tz=timezone.utc)
        mappings = {
            "{YYYY}": now.strftime("%Y"),
            "{MM}": now.strftime("%m"),
            "{DD}": now.strftime("%d"),
            "{name}": to_channel_name(incident_name),
        }
        formatted_channel_name = organisation.settings.slack_channel_name_format

        for t, value in mappings.items():
            formatted_channel_name = formatted_channel_name.replace(t, value)

        # find all used channel names
        used_names: set[str] = set()
        cursor = None
        size = 100
        while True:
            conversation_list_response = self.client.conversations_list(
                types=["private_channel", "public_channel"], limit=size, cursor=cursor
            )

            for channel_data in conversation_list_response.get("channels", []):  # type: ignore
                used_names.add(channel_data["name"])

            if cursor := conversation_list_response.get("response_metadata", {}).get("next_cursor"):
                pass
            else:
                break

        # generate a name that doesn't clash with an existing one
        idx = 1
        channel_name_candidate = formatted_channel_name
        while True:
            if channel_name_candidate in used_names:
                channel_name_candidate = f"{formatted_channel_name}-{idx}"
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
