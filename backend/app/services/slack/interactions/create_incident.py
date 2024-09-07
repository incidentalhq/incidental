import structlog

from app.models import Form, User
from app.repos import IncidentRepo, SeverityRepo
from app.schemas.actions import CreateIncidentSchema
from app.schemas.slack import SlackInteractionSchema
from app.services.incident import IncidentService
from app.services.slack.forms.base import BaseForm

logger = structlog.get_logger(logger_name=__name__)


class CreateIncidentInteraction(BaseForm):
    def __init__(
        self, form: Form, incident_repo: IncidentRepo, incident_service: IncidentService, severity_repo: SeverityRepo
    ):
        self.form = form
        self.incident_service = incident_service
        self.severity_repo = severity_repo
        self.incident_repo = incident_repo

    def handle_submit(self, interaction: SlackInteractionSchema, user: User):
        """Handle the submission of the create incident form in Slack"""
        values = self.get_form_values(form=self.form, interaction=interaction)
        create_in = CreateIncidentSchema.model_validate(values)

        incident = self.incident_service.create_incident_from_schema(create_in=create_in, user=user)

        return incident
