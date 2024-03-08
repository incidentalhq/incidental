from typing import Any

from app.models import Announcement, Organisation, SlackMessage
from app.models.slack_message import SlackMessageKind

from .base_repo import BaseRepo


class SlackMessageRepo(BaseRepo):
    def create_slack_message(
        self,
        organisation: Organisation,
        kind: SlackMessageKind,
        response: dict[str, Any],
        announcement: Announcement | None = None,
    ) -> SlackMessage:
        model = SlackMessage()
        model.organisation_id = organisation.id
        model.slack_channel_id = response["channel"]
        model.slack_message_ts = response["ts"]
        model.kind = kind

        if announcement:
            model.announcement_id = announcement.id

        self.session.add(model)
        self.session.flush()

        return model
