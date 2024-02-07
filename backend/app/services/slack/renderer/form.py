import json

import structlog

from app.models import Form, FormField, IncidentSeverity, IncidentType, Organisation
from app.models.form_field import FormFieldKind

logger = structlog.get_logger(logger_name=__name__)


class FormRenderer:

    def __init__(
        self, organisation: Organisation, severities: list[IncidentSeverity], incident_types: list[IncidentType]
    ):
        self.severities = severities
        self.incident_types = incident_types
        self.organisation = organisation

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
            for sev in self.severities:
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
            default: None | dict = None
            for it in self.incident_types:
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
