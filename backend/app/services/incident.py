import typing

import structlog

from app.exceptions import ValidationError
from app.models import (
    FieldKind,
    Incident,
    IncidentRole,
    IncidentRoleKind,
    IncidentSeverity,
    IncidentStatus,
    IncidentType,
    Organisation,
    User,
)
from app.repos import AnnouncementRepo, FormRepo, IncidentRepo
from app.schemas.actions import CreateIncidentSchema, ExtendedPatchIncidentSchema, PatchIncidentSchema
from app.schemas.tasks import (
    CreateAnnouncementTaskParameters,
    CreateIncidentUpdateParameters,
    CreatePinnedMessageTaskParameters,
    CreateSlackMessageTaskParameters,
    IncidentDeclaredTaskParameters,
    IncidentStatusUpdatedTaskParameters,
    InviteUserToChannelParams,
    JoinChannelTaskParameters,
    SetChannelTopicParameters,
    SyncBookmarksTaskParameters,
)
from app.services.slack.client import SlackClientService

logger = structlog.get_logger(logger_name=__name__)

if typing.TYPE_CHECKING:
    from app.services.events import Events


class IncidentService:
    def __init__(
        self,
        organisation: Organisation,
        incident_repo: IncidentRepo,
        announcement_repo: AnnouncementRepo,
        form_repo: FormRepo,
        events: "Events",
    ):
        self.organisation = organisation
        self.incident_repo = incident_repo
        self.announcement_repo = announcement_repo
        self.slack_service = SlackClientService(auth_token=organisation.slack_bot_token)
        self.events = events
        self.form_repo = form_repo

    def generate_reference_id(self) -> int:
        """Unique organisation level ID for the incident"""
        total_incidents = self.incident_repo.get_total_incidents(organisation=self.organisation)
        return total_incidents + 1

    def generate_incident_reference(self, reference_id: int) -> str:
        """Generate a reference for an incident"""
        mappings = {
            "{id}": str(reference_id),
        }
        reference = self.organisation.settings.incident_reference_format

        for t, value in mappings.items():
            reference = reference.replace(t, value)

        return reference

    def create_incident_from_schema(self, create_in: CreateIncidentSchema, user: User):
        name = None
        incident_type = None
        incident_severity = None
        summary = None

        for field_id, value in create_in.model_dump().items():
            form_field = self.form_repo.get_form_field_by_id(id=field_id)
            if not form_field:
                raise ValidationError("Could not find form field")

            match form_field.fields.kind:
                case FieldKind.INCIDENT_NAME:
                    name = value
                case FieldKind.INCIDENT_SEVERITY:
                    incident_severity = self.incident_repo.get_incident_severity_by_id_or_throw(id=value)
                    if not incident_severity:
                        raise ValueError("Could not find severity")
                case FieldKind.INCIDENT_TYPE:
                    incident_type = self.incident_repo.get_incident_type_by_id(id=value)
                    if not incident_type:
                        raise ValueError("Could not find incident type")
                case FieldKind.INCIDENT_SUMMARY:
                    summary = value

        return self.create_incident(
            name=name,
            summary=summary or "",
            creator=user,
            incident_severity=incident_severity,
            incident_type=incident_type,
        )

    def create_incident(
        self,
        name: str,
        summary: str,
        creator: User,
        incident_severity: IncidentSeverity,
        incident_type: IncidentType,
    ):
        """Create a new incident"""

        # FIXME: this should not be hardcoded
        initial_status_name = "Triage"
        initial_status = self.incident_repo.get_incident_status_by_name(
            organisation=self.organisation, name=initial_status_name
        )
        if not initial_status:
            raise Exception(f"Could not find status: {initial_status_name}")

        # create incident model
        reference_id = self.generate_reference_id()
        reference = self.generate_incident_reference(reference_id=reference_id)
        incident = self.incident_repo.create_incident(
            organisation=self.organisation,
            user=creator,
            name=name,
            summary=summary,
            status=initial_status,
            severity=incident_severity,
            type=incident_type,
            reference=reference,
            reference_id=reference_id,
        )

        # assign role
        role = self.incident_repo.get_incident_role(organisation=self.organisation, kind=IncidentRoleKind.REPORTER)
        if not role:
            raise ValueError("Could not find role reporter")

        self.incident_repo.assign_role(incident=incident, role=role, user=creator)

        # create the channel in slack
        slack_channel_id, channel_name = self.slack_service.create_incident_channel(
            organisation=self.organisation, name=name
        )

        # set the slack fields on the incident
        self.incident_repo.patch_incident(
            incident=incident,
            patch_in=ExtendedPatchIncidentSchema(slack_channel_id=slack_channel_id, slack_channel_name=channel_name),
        )
        if not incident.slack_channel_id:
            raise Exception("incident slack channel id not set")

        # add app to the incident channel
        self.events.queue_job(
            JoinChannelTaskParameters(
                organisation_id=incident.organisation_id,
                slack_channel_id=incident.slack_channel_id,
            )
        )

        # invite user to channel
        self.events.queue_job(
            InviteUserToChannelParams(
                user_id=creator.id, slack_channel_id=incident.slack_channel_id, organisation_id=incident.organisation_id
            ),
        )

        # create an announcement in the configured announcements channel
        self.events.queue_job(
            CreateAnnouncementTaskParameters(incident_id=incident.id),
        )

        # set topic
        self.events.queue_job(
            SetChannelTopicParameters(
                organisation_id=incident.organisation_id,
                topic=incident.reference,
                slack_channel_id=incident.slack_channel_id,
            ),
        )

        # pin a message into the channel
        self.events.queue_job(CreatePinnedMessageTaskParameters(incident_id=incident.id))

        # add bookmarks
        self.events.queue_job(SyncBookmarksTaskParameters(incident_id=incident.id))

        # incident has been declared
        self.events.queue_job(IncidentDeclaredTaskParameters(incident_id=incident.id))

        return incident

    def create_update(
        self,
        incident: Incident,
        creator: User,
        new_status: IncidentStatus | None = None,
        new_severity: IncidentSeverity | None = None,
        summary: str | None = None,
    ):
        """Create an incident update"""
        incident_update = self.incident_repo.create_incident_update(
            incident=incident,
            creator=creator,
            new_status=new_status,
            new_severity=new_severity,
            summary=summary,
        )

        self.events.queue_job(
            CreateIncidentUpdateParameters(
                incident_id=incident.id, incident_update_id=incident_update.id, creator_id=creator.id
            ),
        )
        self.events.queue_job(SyncBookmarksTaskParameters(incident_id=incident.id))

    def patch_incident(self, user: User, incident: Incident, patch_in: PatchIncidentSchema):
        """Change details of an incident"""
        new_status = None
        new_sev = None

        if patch_in.incident_status and patch_in.incident_status.id != incident.incident_status_id:
            new_status = self.incident_repo.get_incident_status_by_id_or_throw(patch_in.incident_status.id)
            self.events.queue_job(
                IncidentStatusUpdatedTaskParameters(
                    incident_id=incident.id, new_status_id=new_status.id, old_status_id=incident.incident_status_id
                )
            )

        if patch_in.incident_severity and patch_in.incident_severity.id != incident.incident_severity_id:
            new_sev = self.incident_repo.get_incident_severity_by_id_or_throw(patch_in.incident_severity.id)

        if new_sev or new_status:
            self.create_update(
                incident=incident,
                creator=user,
                new_severity=new_sev,
                new_status=new_status,
            )

        self.incident_repo.patch_incident(incident=incident, patch_in=patch_in)

    def assign_role(self, incident: Incident, user: User, role: IncidentRole):
        """Assign a role to a user"""

        assign_result = self.incident_repo.assign_role(incident=incident, role=role, user=user)

        # if user has not been changed, we don't need to do anything
        if assign_result.type == "no_change":
            return

        public_message = f"<@{user.slack_user_id}> has been assigned as {role.name} for this incident"

        if incident.slack_channel_id:
            self.events.queue_job(
                CreateSlackMessageTaskParameters(
                    organisation_id=incident.organisation.id,
                    message=public_message,
                    channel_id=incident.slack_channel_id,
                )
            )
        else:
            logger.error("slack channel id not set for incident", incident=incident.id)

        # will add lead info to bookmarks
        self.events.queue_job(
            SyncBookmarksTaskParameters(
                incident_id=incident.id,
            )
        )
