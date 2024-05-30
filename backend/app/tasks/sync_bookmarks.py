from typing import Any, Callable

import structlog
from slack_sdk import WebClient

from app.env import settings
from app.exceptions import ErrorCodes, ExternalApiError
from app.models import Incident, IncidentRoleKind
from app.models.slack_bookmark import SlackBookmarkKind
from app.repos import IncidentRepo
from app.schemas.tasks import SyncBookmarksTaskParameters

from .base import BaseTask

logger = structlog.get_logger(logger_name=__name__)


class SyncBookmarksTask(BaseTask["SyncBookmarksTaskParameters"]):
    def execute(self, parameters: "SyncBookmarksTaskParameters"):
        incident_repo = IncidentRepo(session=self.session)

        incident = incident_repo.get_incident_by_id(id=parameters.incident_id)
        if not incident:
            raise RuntimeError("could not find incident")

        if not incident.slack_channel_id:
            raise Exception("slack channel id not set on incident model")

        client = WebClient(token=incident.organisation.slack_bot_token)

        bookmark_renderers: dict[SlackBookmarkKind, Callable[[Incident], dict[str, str] | None]] = {
            SlackBookmarkKind.HOMEPAGE: self.render_homepage,
            SlackBookmarkKind.SEVERITY: self.render_severity,
            SlackBookmarkKind.STATUS: self.render_status,
            SlackBookmarkKind.LEAD: self.render_lead,
        }

        # remove existing bookmarks
        bookmarks_response = client.bookmarks_list(channel_id=incident.slack_channel_id)
        for item in bookmarks_response.get("bookmarks") or []:
            client.bookmarks_remove(bookmark_id=item["id"], channel_id=incident.slack_channel_id)

        # depending on whether bookmark exists on slack or not, we will update or create it
        for bookmark_kind in list(bookmark_renderers.keys()):
            bookmark_block = bookmark_renderers[bookmark_kind](incident)
            if not bookmark_block:
                continue

            bookmark_add_response = client.bookmarks_add(
                channel_id=incident.slack_channel_id,
                title=bookmark_block["title"],
                type=bookmark_kind,
                emoji=bookmark_block["emoji"],
                link=bookmark_block["link"],
            )
            slack_bookmark_data: dict[str, Any] | None = bookmark_add_response.get("bookmark")
            if not slack_bookmark_data:
                logger.error("Bookmark data not found in response", response=bookmark_add_response.data)
                raise ExternalApiError("Bookmark data not found in response", code=ErrorCodes.SLACK_API_ERROR)

    def render_lead(self, incident: Incident) -> dict[str, str] | None:
        lead = incident.get_user_for_role(IncidentRoleKind.LEAD)
        if not lead:
            return None

        lead_url = f"{settings.FRONTEND_URL}/incident/{incident.id}"
        return {
            "title": f"Lead: {lead.name}",
            "link": lead_url,
            "emoji": ":firefighter:",
            "type": "link",
        }

    def render_status(self, incident: Incident):
        status_url = f"{settings.FRONTEND_URL}/incident/{incident.id}"
        return {
            "title": f"Status: {incident.incident_status.name}",
            "link": status_url,
            "emoji": ":traffic_light:",
            "type": "link",
        }

    def render_severity(self, incident: Incident):
        sev_url = f"{settings.FRONTEND_URL}/incident/{incident.id}"
        return {
            "title": f"Severity: {incident.incident_severity.name}",
            "link": sev_url,
            "emoji": ":zap:",
            "type": "link",
        }

    def render_homepage(self, incident: Incident):
        incident_url = f"{settings.FRONTEND_URL}/incident/{incident.id}"
        return {
            "title": "Homepage",
            "link": incident_url,
            "emoji": ":house:",
            "type": "link",
        }
