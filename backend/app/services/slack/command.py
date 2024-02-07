import json

import structlog
from slack_sdk import WebClient

from app.models import Form, FormField, Organisation
from app.models.form import FormType
from app.models.form_field import FormFieldKind
from app.repos import FormRepo, IncidentRepo, SeverityRepo
from app.schemas.slack import SlackCommandDataSchema

logger = structlog.get_logger(logger_name=__name__)


class SlackCommandService:
    def __init__(
        self, organisation: Organisation, form_repo: FormRepo, severity_repo: SeverityRepo, incident_repo: IncidentRepo
    ):
        self.severity_repo = severity_repo
        self.incident_repo = incident_repo
        self.organisation = organisation
        self.form_repo = form_repo

    def handle_command(self, command: SlackCommandDataSchema):
        slack_client = WebClient(token=self.organisation.slack_bot_token)

        create_incident_form = self.form_repo.get_form(
            organisation=self.organisation, form_type=FormType.CREATE_INCIDENT
        )
        if not create_incident_form:
            logger.error("Could not find create incident form")
            raise Exception("Could not create incident form")

        modal = self.create_form_modal(form=create_incident_form)

        slack_client.views_open(trigger_id=command.trigger_id, view=modal)

    def create_form_modal(self, form: Form) -> dict:
        blocks = []
        for field in form.form_fields:
            block = self.render_block(field)
            if block:
                blocks.append(block)

        modal = {
            "type": "modal",
            "callback_id": f"form-{form.id}",
            "title": {"type": "plain_text", "text": form.name},
            "submit": {"type": "plain_text", "text": "Create"},
            "blocks": blocks,
            "private_metadata": json.dumps(
                {
                    "form_id": form.id,
                }
            ),
        }

        return modal

    def render_block(self, form_field: FormField) -> dict:
        if form_field.kind == FormFieldKind.TEXT:
            return {
                "type": "input",
                "block_id": f"block-{form_field.id}",
                "label": {"type": "plain_text", "text": form_field.name},
                "element": {
                    "type": "plain_text_input",
                    "multiline": False,
                    "action_id": form_field.id,
                    "initial_value": form_field.default_value if form_field.default_value else "",
                },
                "hint": {
                    "type": "plain_text",
                    "text": form_field.description,
                },
            }
        elif form_field.kind == FormFieldKind.SEVERITY_TYPE:
            options = []
            severities = self.severity_repo.get_all(organisation=self.organisation)
            for sev in severities:
                options.append(
                    {
                        "text": {"type": "plain_text", "text": sev.name},
                        "value": sev.id,
                    }
                )

            return {
                "type": "input",
                "block_id": f"block-{form_field.id}",
                "label": {"type": "plain_text", "text": "Pick a severity level"},
                "element": {
                    "type": "static_select",
                    "action_id": form_field.id,
                    "options": options,
                },
            }
        elif form_field.kind == FormFieldKind.INCIDENT_TYPE:
            options = []
            incident_types = self.incident_repo.get_all(organisation=self.organisation)
            default: None | dict = None
            for it in incident_types:
                opt = {
                    "text": {"type": "plain_text", "text": it.name},
                    "value": it.id,
                }
                options.append(opt)
                if it.name == "Default":
                    default = opt

            return {
                "type": "input",
                "block_id": f"block-{form_field.id}",
                "label": {"type": "plain_text", "text": "Pick an incident type"},
                "element": {
                    "type": "static_select",
                    "action_id": form_field.id,
                    "options": options,
                    "initial_option": default,
                },
            }
        else:
            raise Exception("Unknown field type")
