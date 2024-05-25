import structlog

from app.models import Form, User
from app.repos import IncidentRepo, SeverityRepo
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
        # name
        name_value = self.get_field_value(self.form, interaction=interaction, field_name="incident_name")

        # severity
        severity_id = self.get_field_value(self.form, interaction=interaction, field_name="incident_severity")
        severity = self.severity_repo.get_severity_by_id(id=severity_id)
        if not severity:
            raise RuntimeError("Could not find severity")

        # incident type
        incident_type_id = self.get_field_value(self.form, interaction=interaction, field_name="incident_type")
        incident_type = self.incident_repo.get_incident_type_by_id(id=incident_type_id)
        if not incident_type:
            raise RuntimeError("Could not find incident type")

        # description
        summary = self.get_field_value(self.form, interaction=interaction, field_name="summary")

        incident = self.incident_service.create_incident(
            name=name_value, summary=summary, creator=user, incident_severity=severity, incident_type=incident_type
        )

        return incident
