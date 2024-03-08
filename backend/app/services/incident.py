import structlog

from app.models import Incident, IncidentRoleKind, IncidentSeverity, IncidentStatus, IncidentType, Organisation, User
from app.repos import AnnouncementRepo, IncidentRepo
from app.schemas.actions import PatchIncidentSchema
from app.services.slack.client import SlackClientService

logger = structlog.get_logger(logger_name=__name__)


class IncidentService:
    def __init__(
        self,
        organisation: Organisation,
        incident_repo: IncidentRepo,
        announcement_repo: AnnouncementRepo,
    ):
        self.organisation = organisation
        self.incident_repo = incident_repo
        self.announcement_repo = announcement_repo
        self.slack_service = SlackClientService(auth_token=organisation.slack_bot_token, session=incident_repo.session)

    def generate_incident_reference(self) -> str:
        total_incidents = self.incident_repo.get_total_incidents(organisation=self.organisation)
        mappings = {
            "{id}": str(total_incidents + 1),
        }
        reference = self.organisation.settings.incident_reference_format

        for t, value in mappings.items():
            reference = reference.replace(t, value)

        return reference

    def create_incident(
        self,
        name: str,
        summary: str,
        creator: User,
        incident_severity: IncidentSeverity,
        incident_type: IncidentType,
    ):
        # FIXME: this should not be hardcoded
        status_name = "Triage"
        status = self.incident_repo.get_incident_status_by_name(organisation=self.organisation, name=status_name)
        if not status:
            raise Exception(f"Could not find status: {status_name}")

        reference = self.generate_incident_reference()

        # create the channel in slack
        slack_channel_id, channel_name = self.slack_service.create_incident_channel(
            organisation=self.organisation, name=name
        )

        # finally create the incident
        incident = self.incident_repo.create_incident(
            organisation=self.organisation,
            user=creator,
            name=name,
            summary=summary,
            status=status,
            severity=incident_severity,
            type=incident_type,
            reference=reference,
            slack_channel_id=slack_channel_id,
            slack_channel_name=channel_name,
        )

        # assign role
        role = self.incident_repo.get_incident_role(organisation=self.organisation, kind=IncidentRoleKind.REPORTER)
        if not role:
            raise ValueError("Could not find role reporter")

        self.incident_repo.assign_role(incident=incident, role=role, user=creator)

        # invite user to channel
        self.slack_service.invite_user_to_incident_channel(incident=incident, user=creator)

        # create an announcement in the #incidents channel
        self.create_announcement(incident)

        self.set_topic(incident)

        # pin a message into the channel
        self.slack_service.create_pinned_message(incident=incident)

        # add bookmarks
        self.add_bookmarks(incident)

        return incident

    def create_announcement(self, incident: Incident):
        """Announce the incident"""

        # create the announcements channel
        announcements_channel_name = incident.organisation.settings.slack_announcement_channel_name
        channel_id = self.slack_service.create_channel_if_not_exists(channel_name=announcements_channel_name)

        if incident.organisation.settings.slack_announcement_channel_id != channel_id:
            incident.organisation.settings.slack_announcement_channel_id = channel_id

        # get announcement
        announcement = self.announcement_repo.get_announcement(organisation=incident.organisation)
        if not announcement:
            raise Exception("Could not find announcement")

        self.slack_service.post_announcement(channel_id=channel_id, announcement=announcement, incident=incident)

    def create_update(
        self,
        incident: Incident,
        creator: User,
        new_status: IncidentStatus | None = None,
        new_severity: IncidentSeverity | None = None,
        summary: str | None = None,
    ):
        incident_update = self.incident_repo.create_incident_update(
            incident=incident,
            creator=creator,
            new_status=new_status,
            new_severity=new_severity,
            summary=summary,
        )
        self.slack_service.create_incident_update(creator=creator, incident=incident, incident_update=incident_update)

    def set_topic(self, incident: Incident):
        self.slack_service.set_incident_channel_topic(incident=incident)

    def add_bookmarks(self, incident: Incident):
        """Add channel bookmarks"""
        self.slack_service.set_incident_channel_bookmarks(incident=incident)

    def patch_incident(self, user: User, incident: Incident, patch_in: PatchIncidentSchema):
        new_status = None
        new_sev = None

        if patch_in.incident_status and patch_in.incident_status.id != incident.incident_status_id:
            new_status = self.incident_repo.get_incident_status_by_id(patch_in.incident_status.id)

        if patch_in.incident_severity and patch_in.incident_severity.id != incident.incident_severity_id:
            new_sev = self.incident_repo.get_incident_severity_by_id(patch_in.incident_severity.id)

        if new_sev or new_status:
            self.create_update(
                incident=incident,
                creator=user,
                new_severity=new_sev,
                new_status=new_status,
            )

        self.incident_repo.patch_incident(incident=incident, patch_in=patch_in)
