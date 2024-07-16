import structlog

from app.models import FieldKind, Form, Incident, User
from app.repos import IncidentRepo
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
        incident_severity = self.get_field_value(self.form, interaction, field_kind=FieldKind.INCIDENT_SEVERITY)
        incident_status = self.get_field_value(self.form, interaction, field_kind=FieldKind.INCIDENT_STATUS)
        summary = self.get_field_value(self.form, interaction, field_kind=FieldKind.INCIDENT_SUMMARY)

        severity = self.incident_repo.get_incident_severity_by_id_or_throw(incident_severity)
        if not severity:
            raise RuntimeError("Could not find severity")

        status = self.incident_repo.get_incident_status_by_id_or_throw(incident_status)
        if not status:
            raise RuntimeError("Could not find status")

        # only create an update if something has changed
        if (
            severity.id != self.incident.incident_severity_id
            or status.id != self.incident.incident_status_id
            or summary is not None
        ):
            self.incident_service.create_update(
                incident=self.incident,
                creator=user,
                new_status=status,
                new_severity=severity,
                summary=summary,
            )

        self.session.flush()
