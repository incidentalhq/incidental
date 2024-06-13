import json
from typing import Any

import structlog

from app.models import Form, Incident, Organisation, User
from app.models.form import FormKind
from app.repos import FormRepo, IncidentRepo, SeverityRepo
from app.schemas.slack import SlackInteractionSchema
from app.services.incident import IncidentService
from app.services.slack.interactions.create_incident import CreateIncidentInteraction
from app.services.slack.interactions.update_incident import UpdateIncidentInteraction
from app.services.slack.user import SlackUserService

logger = structlog.get_logger(logger_name=__name__)


class SlackInteractionService:
    def __init__(
        self,
        form_repo: FormRepo,
        incident_repo: IncidentRepo,
        slack_user_service: SlackUserService,
        incident_service: IncidentService,
        severity_repo: SeverityRepo,
    ) -> None:
        self.form_repo = form_repo
        self.incident_repo = incident_repo
        self.slack_user_service = slack_user_service
        self.incident_service = incident_service
        self.severity_repo = severity_repo

    def handle_interaction(self, interaction: SlackInteractionSchema, organisation: Organisation, user: User):
        match interaction.payload["type"]:
            case "view_submission":
                self.handle_view_submission(interaction, organisation, user)
            case "block_actions":
                logger.warning("block_actions received")
                return
            case _:
                raise Exception("Unknown type")

    def handle_view_submission(self, interaction: SlackInteractionSchema, organisation: Organisation, user: User):
        metadata = json.loads(interaction.payload["view"]["private_metadata"])
        form_id = metadata["form_id"]

        form = self.form_repo.get_form_by_id(form_id)
        if not form:
            raise Exception("Unable to find form for slack view")

        match form.type:
            case FormKind.CREATE_INCIDENT:
                return self.create_incident(user, form, organisation, interaction, metadata)
            case FormKind.UPDATE_INCIDENT:
                return self.update_incident(user, form, organisation, interaction, metadata)

    def create_incident(
        self,
        user: User,
        form: Form,
        organisation: Organisation,
        interaction: SlackInteractionSchema,
        metadata: dict[str, Any],
    ) -> Incident:
        create_incident_interaction = CreateIncidentInteraction(
            form=form,
            incident_repo=self.incident_repo,
            incident_service=self.incident_service,
            severity_repo=self.severity_repo,
        )

        return create_incident_interaction.handle_submit(interaction=interaction, user=user)

    def update_incident(
        self,
        user: User,
        form: Form,
        organisation: Organisation,
        interaction: SlackInteractionSchema,
        metadata: dict[str, Any],
    ):
        incident_id = metadata["incident_id"]
        incident = self.incident_repo.get_incident_by_id(incident_id)
        if not incident:
            raise Exception("Incident not found")

        update_incident_form_interaction = UpdateIncidentInteraction(
            form=form,
            incident=incident,
            incident_repo=self.incident_repo,
            incident_service=self.incident_service,
        )
        update_incident_form_interaction.handle_submit(interaction, user=user)
