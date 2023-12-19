from typing import Sequence

from sqlalchemy import select

from app.models import Incident, SlackBookmark
from app.models.slack_bookmark import SlackBookmarkKind

from .base_repo import BaseRepo


class SlackBookmarkRepo(BaseRepo):
    def get_all_for_channel(self, slack_channel_id: str) -> Sequence[SlackBookmark]:
        stmt = select(SlackBookmark).where(SlackBookmark.slack_channel_id == slack_channel_id)

        return self.session.scalars(stmt).all()

    def create_bookmark(self, incident: Incident, bookmark_id: str, kind: SlackBookmarkKind) -> SlackBookmark:
        model = SlackBookmark()
        model.slack_bookmark_id = bookmark_id
        model.slack_channel_id = incident.slack_channel_id
        model.organisation_id = incident.organisation_id
        model.kind = kind

        self.session.add(model)
        self.session.flush()

        return model
