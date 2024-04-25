from sqlalchemy import select

from app.models import (
    Announcement,
    AnnouncementActions,
    AnnouncementFields,
    Organisation,
    SlackMessage,
)

from .base_repo import BaseRepo


class AnnouncementRepo(BaseRepo):
    def get_announcement(self, organisation: Organisation) -> Announcement | None:
        stmt = select(Announcement).where(Announcement.organisation_id == organisation.id).limit(1)
        return self.session.scalar(stmt)

    def create_slack_message(self, announcement: Announcement, slack_message_id: str) -> SlackMessage:
        model = SlackMessage()
        model.announcement_id = announcement.id
        model.slack_message_ts = slack_message_id

        self.session.add(model)
        self.session.flush()

        return model

    def create_announcement(
        self,
        organisation: Organisation,
        fields: list[AnnouncementFields],
        actions: list[AnnouncementActions],
    ) -> Announcement:
        model = Announcement()
        model.organisation_id = organisation.id
        model.actions = actions
        model.fields = fields

        self.session.add(model)
        self.session.flush()

        return model
