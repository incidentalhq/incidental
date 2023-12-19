import structlog

from app.models import Form, Incident, User
from app.repos import IncidentRepo
from app.schemas.slack import SlackInteractionSchema
from app.services.incident import IncidentService
from app.services.slack.renderer.form import FormRenderer, RenderContext

from .base import BaseForm

logger = structlog.get_logger(logger_name=__name__)


class UpdateIncidentForm(BaseForm):
    def __init__(
        self,
        form: Form,
        incident: Incident,
        form_renderer: FormRenderer,
        incident_repo: IncidentRepo,
        incident_service: IncidentService,
    ):
        self.form = form
        self.incident = incident
        self.form_renderer = form_renderer
        self.incident_repo = incident_repo
        self.session = self.incident_repo.session
        self.incident_service = incident_service

    def render(self):
        context = RenderContext(incident=self.incident)
        modal = self.form_renderer.render(form=self.form, context=context)
        return modal

    def handle_submit(self, interaction: SlackInteractionSchema, user: User):
        incident_severity = self.get_field_value(self.form, interaction, field_name="incident_severity")
        incident_status = self.get_field_value(self.form, interaction, field_name="incident_status")
        summary = self.get_field_value(self.form, interaction, field_name="summary")

        severity = self.incident_repo.get_incident_severity_by_id(incident_severity)
        status = self.incident_repo.get_incident_status_by_id(incident_status)

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
