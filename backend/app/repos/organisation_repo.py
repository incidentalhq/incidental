from pydantic.alias_generators import to_snake
from sqlalchemy import select

from app.models import Organisation, OrganisationMember, User

from .base_repo import BaseRepo


class OrganisationRepo(BaseRepo):
    def create_organisation(
        self, name: str, slack_team_name: str | None = None, slack_team_id: str | None = None
    ) -> Organisation:
        organisation = Organisation()
        organisation.name = name
        organisation.slug = to_snake(name).replace("_", "-")  # kebab-case it
        organisation.slack_team_id = slack_team_id
        organisation.slack_team_name = slack_team_name

        self.session.add(organisation)
        self.session.flush()

        return organisation

    def get_member(self, user: User, organisation: Organisation) -> OrganisationMember | None:
        stmt = (
            select(OrganisationMember)
            .where(OrganisationMember.organisation_id == organisation.id, OrganisationMember.user_id == user.id)
            .limit(1)
        )

        return self.session.scalar(stmt)

    def add_member(self, user: User, organisation: Organisation, role: str) -> OrganisationMember:
        member = OrganisationMember()
        member.organisation_id = organisation.id
        member.user_id = user.id
        member.role = role

        self.session.add(member)
        self.session.flush()

        return member

    def get_by_slack_team_id(self, slack_team_id: str) -> Organisation | None:
        query = select(Organisation).where(Organisation.slack_team_id == slack_team_id).limit(1)

        return self.session.scalars(query).first()

    def get_by_id(self, id: str) -> Organisation | None:
        stmt = select(Organisation).where(Organisation.id == id).limit(1)
        return self.session.scalar(stmt)
