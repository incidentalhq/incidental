import structlog
from slack_sdk import WebClient

from app.models.form import FormKind
from app.repos import LifecycleRepo
from app.schemas.slack import SlackCommandDataSchema
from app.services.slack.renderer.form import FormRenderer, RenderContext

from .base import SlackCommandHandlerBase

logger = structlog.get_logger(logger_name=__name__)


class CreateIncidentCommand(SlackCommandHandlerBase):
    """Launch the create incident form"""

    def can_trigger(self, command: SlackCommandDataSchema) -> bool:
        """Only trigger this if we're not in an incident channel"""
        if not self._is_incident_channel(command.channel_id):
            return True
        return False

    def execute(self, command: SlackCommandDataSchema):
        slack_client = WebClient(token=self.organisation.slack_bot_token)
        lifecycle_repo = LifecycleRepo(session=self.session)

        create_incident_form = self.form_repo.get_form(
            organisation=self.organisation, form_type=FormKind.CREATE_INCIDENT
        )
        if not create_incident_form:
            raise RuntimeError("Could not find create incident form")

        context = RenderContext(lifecycle=lifecycle_repo.get_lifecycle_for_organisation_or_raise(self.organisation))

        form_renderer = FormRenderer(
            severities=self.severity_repo.get_all(organisation=self.organisation),
            incident_types=self.incident_repo.get_all_incident_types(self.organisation),
            incident_statuses=self.incident_repo.get_all_incident_statuses(self.organisation),
        )
        rendered_form_view = form_renderer.render(form=create_incident_form, context=context)
        slack_client.views_open(trigger_id=command.trigger_id, view=rendered_form_view)
