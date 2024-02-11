import json

from app.models import Incident, IncidentRoleKind, Organisation
from app.models.form import FormType
from app.repos import FormRepo, IncidentRepo
from app.schemas.slack import SlackInteractionSchema
from app.services.incident import IncidentService
from app.services.slack.user import SlackUserService


class SlackInteractionService:
    def __init__(
        self,
        form_repo: FormRepo,
        incident_repo: IncidentRepo,
        slack_user_service: SlackUserService,
        incident_service: IncidentService,
    ) -> None:
        self.form_repo = form_repo
        self.incident_repo = incident_repo
        self.slack_user_service = slack_user_service
        self.incident_service = incident_service

    def handle_interaction(self, interaction: SlackInteractionSchema, organisation: Organisation):
        match interaction.payload["type"]:
            case "view_submission":
                self.handle_view_submission(interaction, organisation)
            case _:
                raise Exception("Unknown type")

    def handle_view_submission(self, interaction: SlackInteractionSchema, organisation: Organisation):
        private_metadata = json.loads(interaction.payload["view"]["private_metadata"])
        form_id = private_metadata["form_id"]

        form = self.form_repo.get_form_by_id(form_id)
        if not form:
            raise Exception("Unable to find form for slack view")

        if form.type == FormType.CREATE_INCIDENT:
            self.create_incident(organisation, interaction=interaction)

    def create_incident(self, organisation: Organisation, interaction: SlackInteractionSchema) -> Incident:
        form_state_values = interaction.payload["view"]["state"]["values"]
        private_metadata = json.loads(interaction.payload["view"]["private_metadata"])

        form = self.form_repo.get_form_by_id(private_metadata["form_id"])
        if not form:
            raise Exception("Could not find form")

        name_field = self.form_repo.get_form_field_by_name(form=form, name="Name")
        name_value = form_state_values[f"block-{name_field.id}"][name_field.id]["value"]

        # severity
        sev_field = self.form_repo.get_form_field_by_name(form=form, name="Severity")
        sev_id = form_state_values[f"block-{sev_field.id}"][sev_field.id]["selected_option"]["value"]
        severity = self.incident_repo.get_incident_severity_by_id(id=sev_id)

        # incident type
        type_field = self.form_repo.get_form_field_by_name(form=form, name="Incident type")
        type_id = form_state_values[f"block-{type_field.id}"][type_field.id]["selected_option"]["value"]
        incident_type = self.incident_repo.get_incident_type_by_id(id=type_id)

        user = self.slack_user_service.get_or_create_user_from_slack_id(
            interaction.payload["user"]["id"], organisation=organisation
        )
        incident = self.incident_service.create_incident(
            name=name_value, creator=user, incident_severity=severity, incident_type=incident_type
        )

        # assign role
        role = self.incident_repo.get_incident_role(organisation=organisation, kind=IncidentRoleKind.REPORTER)
        if not role:
            raise Exception("Could not find role reporter")

        self.incident_repo.assign_role(incident=incident, role=role, user=user)

        return incident
