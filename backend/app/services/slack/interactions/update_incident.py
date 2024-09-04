import structlog

from app.models import Form, Incident, User
from app.repos import IncidentRepo
from app.schemas.actions import CreateIncidentUpdateSchema
from app.schemas.slack import SlackInteractionSchema
from app.services.incident import IncidentService
from app.services.slack.forms.base import BaseForm

logger = structlog.get_logger(logger_name=__name__)


class UpdateIncidentInteraction(BaseForm):
    def __init__(
        self,
        form: Form,
        incident: Incident,
        incident_repo: IncidentRepo,
        incident_service: IncidentService,
    ):
        self.form = form
        self.incident = incident
        self.incident_repo = incident_repo
        self.session = self.incident_repo.session
        self.incident_service = incident_service

    def handle_submit(self, interaction: SlackInteractionSchema, user: User):
        values = self.get_form_values(form=self.form, interaction=interaction)
        create_in = CreateIncidentUpdateSchema.model_validate(values)
        self.incident_service.create_update_from_schema(incident=self.incident, creator=user, create_in=create_in)
        self.session.flush()
