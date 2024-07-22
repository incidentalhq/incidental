import structlog
from slack_sdk import WebClient

from app.models.form import FormKind
from app.schemas.slack import SlackCommandDataSchema
from app.services.slack.renderer.form import FormRenderer, RenderContext

from .base import SlackCommandHandlerBase

logger = structlog.get_logger(logger_name=__name__)


class UpdateStatusCommand(SlackCommandHandlerBase):
    """Open the update status modal"""

    trigger_word = "status"
    trigger_in_incident_channel = True

    def execute(self, command: SlackCommandDataSchema):
        logger.info("Opening update status form")
        update_incident_form_model = self.form_repo.get_form(
            organisation=self.organisation, form_type=FormKind.UPDATE_INCIDENT
        )
        if not update_incident_form_model:
            raise RuntimeError("Could not find update incident status form")

        incident = self.incident_repo.get_incident_by_slack_channel_id(command.channel_id)
        if not incident:
            raise RuntimeError("Could not find associated incident")

        form_renderer = FormRenderer(
            severities=self.severity_repo.get_all(organisation=self.organisation),
            incident_types=self.incident_repo.get_all_incident_types(self.organisation),
            incident_statuses=self.incident_repo.get_all_incident_statuses(self.organisation),
        )
        rendered_form_view = form_renderer.render(
            form=update_incident_form_model, context=RenderContext(incident=incident)
        )

        slack_client = WebClient(token=self.organisation.slack_bot_token)
        slack_client.views_open(trigger_id=command.trigger_id, view=rendered_form_view)
