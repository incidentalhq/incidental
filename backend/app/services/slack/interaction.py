import json
from typing import Any

import structlog

from app.models import Form, Incident, IncidentRoleKind, Organisation, User
from app.models.form import FormType
from app.repos import FormRepo, IncidentRepo, SeverityRepo
from app.schemas.slack import SlackInteractionSchema
from app.services.incident import IncidentService
from app.services.slack.forms.update_incident import UpdateIncidentForm
from app.services.slack.renderer.form import FormRenderer
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
            case FormType.CREATE_INCIDENT:
                return self.create_incident(user, form, organisation, interaction, metadata)
            case FormType.UPDATE_INCIDENT:
                return self.update_incident(user, form, organisation, interaction, metadata)

    def create_incident(
        self,
        user: User,
        form: Form,
        organisation: Organisation,
        interaction: SlackInteractionSchema,
        metadata: dict[str, Any],
    ) -> Incident:
        form_state_values = interaction.payload["view"]["state"]["values"]

        # name
        name_field = self.form_repo.get_form_field_by_name(form=form, name="incident_name")
        name_value = form_state_values[f"block-{name_field.id}"][name_field.id]["value"]

        # severity
        sev_field = self.form_repo.get_form_field_by_name(form=form, name="incident_severity")
        sev_id = form_state_values[f"block-{sev_field.id}"][sev_field.id]["selected_option"]["value"]
        severity = self.incident_repo.get_incident_severity_by_id(id=sev_id)

        # incident type
        type_field = self.form_repo.get_form_field_by_name(form=form, name="incident_type")
        type_id = form_state_values[f"block-{type_field.id}"][type_field.id]["selected_option"]["value"]
        incident_type = self.incident_repo.get_incident_type_by_id(id=type_id)

        # description
        type_field = self.form_repo.get_form_field_by_name(form=form, name="summary")
        summary = form_state_values[f"block-{type_field.id}"][type_field.id]["value"]

        incident = self.incident_service.create_incident(
            name=name_value, summary=summary, creator=user, incident_severity=severity, incident_type=incident_type
        )

        # assign role
        role = self.incident_repo.get_incident_role(organisation=organisation, kind=IncidentRoleKind.REPORTER)
        if not role:
            raise Exception("Could not find role reporter")

        self.incident_repo.assign_role(incident=incident, role=role, user=user)

        return incident

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

        renderer = FormRenderer(
            severities=self.severity_repo.get_all(organisation),
            incident_types=self.incident_repo.get_all_incident_types(organisation),
            incident_statuses=self.incident_repo.get_all_incident_statuses(organisation),
        )
        update_incident_form = UpdateIncidentForm(
            form=form,
            incident=incident,
            form_renderer=renderer,
            incident_repo=self.incident_repo,
            incident_service=self.incident_service,
        )
        update_incident_form.handle_submit(interaction, user=user)
