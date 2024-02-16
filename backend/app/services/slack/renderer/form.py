import json
from typing import Any

import structlog
from pydantic import BaseModel, ConfigDict

from app.models import (
    Form,
    FormField,
    Incident,
    IncidentSeverity,
    IncidentStatus,
    IncidentType,
)
from app.models.form_field import FormFieldKind

logger = structlog.get_logger(logger_name=__name__)


class RenderContext(BaseModel):
    incident: Incident | None = None

    model_config = ConfigDict(arbitrary_types_allowed=True)


class FormRenderer:

    def __init__(
        self,
        severities: list[IncidentSeverity],
        incident_types: list[IncidentType],
        incident_statuses: list[IncidentStatus],
    ):
        self.severities = severities
        self.incident_types = incident_types
        self.incident_statuses = incident_statuses

    def render(self, form: Form, context: RenderContext | None = None) -> dict[str, Any]:
        blocks = []
        for field in form.form_fields:
            block = self._render_block(field, context)
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
                    "incident_id": context.incident.id if context and context.incident else None,
                }
            ),
        }
        print(modal)

        return modal

    def _render_severity_type(self, form_field: FormField, context: RenderContext | None = None) -> dict:
        options = []
        for sev in self.severities:
            options.append(
                {
                    "text": {"type": "plain_text", "text": sev.name},
                    "value": sev.id,
                }
            )

        initial_option: None | dict = None
        if context and context.incident:
            initial_option = {
                "text": {
                    "type": "plain_text",
                    "text": context.incident.incident_severity.name,
                },
                "value": context.incident.incident_severity.id,
            }

        rendered_field: dict[str, Any] = {
            "type": "input",
            "block_id": f"block-{form_field.id}",
            "label": {
                "type": "plain_text",
                "text": form_field.label,
            },
            "element": {
                "type": "static_select",
                "action_id": form_field.id,
                "options": options,
            },
            "optional": False if form_field.is_required else True,
        }

        if initial_option:
            rendered_field["element"]["initial_option"] = initial_option

        return rendered_field

    def _render_incident_type(self, form_field: FormField, context: RenderContext | None = None) -> dict:
        options = []
        initial_option: None | dict = None
        for inc_type in self.incident_types:
            opt = {
                "text": {"type": "plain_text", "text": inc_type.name},
                "value": inc_type.id,
            }
            options.append(opt)
            if inc_type.name == "Default":
                initial_option = opt

        if context and context.incident:
            initial_option = {
                "text": {
                    "type": "plain_text",
                    "text": context.incident.incident_type.name,
                },
                "value": context.incident.incident_type.id,
            }

        rendered_field = {
            "type": "input",
            "block_id": f"block-{form_field.id}",
            "label": {
                "type": "plain_text",
                "text": form_field.label,
            },
            "element": {
                "type": "static_select",
                "action_id": form_field.id,
                "options": options,
                "initial_option": initial_option,
            },
            "optional": False if form_field.is_required else True,
        }

        return rendered_field

    def _render_incident_status(self, form_field: FormField, context: RenderContext | None = None) -> dict[str, Any]:
        options = []
        initial_option: dict | None = None
        for inc_status in self.incident_statuses:
            opt = {
                "text": {
                    "type": "plain_text",
                    "text": inc_status.name,
                },
                "value": inc_status.id,
            }
            options.append(opt)

        if context and context.incident:
            initial_option = {
                "text": {
                    "type": "plain_text",
                    "text": context.incident.incident_status.name,
                },
                "value": context.incident.incident_status.id,
            }

        rendered_field: dict[str, Any] = {
            "type": "input",
            "block_id": f"block-{form_field.id}",
            "label": {
                "type": "plain_text",
                "text": form_field.label,
            },
            "element": {
                "type": "static_select",
                "action_id": form_field.id,
                "options": options,
            },
            "optional": False if form_field.is_required else True,
            "dispatch_action": True,
        }

        if initial_option:
            rendered_field["element"]["initial_option"] = initial_option

        return rendered_field

    def _render_text(self, form_field: FormField, context: RenderContext | None = None) -> dict[str, Any]:
        block = {
            "type": "input",
            "block_id": f"block-{form_field.id}",
            "label": {"type": "plain_text", "text": form_field.label},
            "element": {
                "type": "plain_text_input",
                "multiline": False,
                "action_id": form_field.id,
                "initial_value": form_field.default_value if form_field.default_value else "",
            },
            "optional": False if form_field.is_required else True,
        }
        if form_field.description:
            block["hint"] = {"type": "plain_text", "text": form_field.description}

        return block

    def _render_multi_line_text(self, form_field: FormField, context: RenderContext | None = None) -> dict[str, Any]:
        block = {
            "type": "input",
            "block_id": f"block-{form_field.id}",
            "label": {"type": "plain_text", "text": form_field.label},
            "element": {
                "type": "plain_text_input",
                "multiline": True,
                "action_id": form_field.id,
                "initial_value": form_field.default_value if form_field.default_value else "",
            },
            "optional": False if form_field.is_required else True,
        }
        if form_field.description:
            block["hint"] = {"type": "plain_text", "text": form_field.description}

        return block

    def _render_block(self, form_field: FormField, context: RenderContext | None = None) -> dict:
        if form_field.kind == FormFieldKind.TEXT:
            return self._render_text(form_field=form_field, context=context)
        elif form_field.kind == FormFieldKind.TEXTAREA:
            return self._render_multi_line_text(form_field=form_field, context=context)
        elif form_field.kind == FormFieldKind.SEVERITY_TYPE:
            return self._render_severity_type(form_field=form_field, context=context)
        elif form_field.kind == FormFieldKind.INCIDENT_TYPE:
            return self._render_incident_type(form_field=form_field, context=context)
        elif form_field.kind == FormFieldKind.INCIDENT_STATUS:
            return self._render_incident_status(form_field=form_field, context=context)
        else:
            raise Exception("Unknown field type")
