import json
from typing import Any, Sequence

import structlog
from pydantic import BaseModel, ConfigDict

from app.models import (
    FieldKind,
    Form,
    FormField,
    Incident,
    IncidentSeverity,
    IncidentStatus,
    IncidentStatusCategoryEnum,
    IncidentType,
    InterfaceKind,
    Lifecycle,
    RequirementTypeEnum,
)

logger = structlog.get_logger(logger_name=__name__)


class RenderContext(BaseModel):
    incident: Incident | None = None
    lifecycle: Lifecycle | None = None

    model_config = ConfigDict(arbitrary_types_allowed=True)


class FormRenderer:
    def __init__(
        self,
        severities: Sequence[IncidentSeverity],
        incident_types: Sequence[IncidentType],
        incident_statuses: Sequence[IncidentStatus],
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

        return modal

    def _render_severity_type(self, form_field: FormField, context: RenderContext | None = None) -> dict:
        options = []
        for sev in self.severities:
            opt = self._create_option_value(name=sev.name, value=sev.id)
            options.append(opt)

        initial_option: None | dict = None
        if context and context.incident:
            initial_option = self._create_option_value(
                name=context.incident.incident_severity.name, value=context.incident.incident_severity.id
            )
        elif form_field.default_value:
            label = ""
            default_sev: list[IncidentSeverity] = list(
                filter(lambda it: it.id == form_field.default_value, self.severities)
            )
            if default_sev:
                label = default_sev[0].name
                initial_option = self._create_option_value(name=label, value=form_field.default_value)

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
            "optional": True if form_field.requirement_type == RequirementTypeEnum.OPTIONAL else False,
        }

        if initial_option:
            rendered_field["element"]["initial_option"] = initial_option

        return rendered_field

    def _render_incident_type(self, form_field: FormField, context: RenderContext | None = None) -> dict:
        options = []
        initial_option: None | dict = None
        for inc_type in self.incident_types:
            opt = self._create_option_value(name=inc_type.name, value=inc_type.id)
            options.append(opt)
            if inc_type.name == "Default":
                initial_option = opt

        if context and context.incident:
            initial_option = self._create_option_value(
                name=context.incident.incident_type.name, value=context.incident.incident_type.id
            )

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
            "optional": True if form_field.requirement_type == RequirementTypeEnum.OPTIONAL else False,
        }

        return rendered_field

    def _render_initial_incident_status(
        self, form_field: FormField, context: RenderContext | None = None
    ) -> dict[str, Any] | None:
        # If triage is not available, don't render this field
        if context and context.lifecycle:
            if not context.lifecycle.is_triage_available:
                return None

        triage = list(filter(lambda it: it.category == IncidentStatusCategoryEnum.TRIAGE, self.incident_statuses))[0]
        active_status = list(
            filter(lambda it: it.category == IncidentStatusCategoryEnum.ACTIVE, self.incident_statuses)
        )[0]

        options = [
            self._create_option_value("Triage", triage.id),
            self._create_option_value("Active", active_status.id),
        ]

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
            "optional": True if form_field.requirement_type == RequirementTypeEnum.OPTIONAL else False,
            "dispatch_action": True,
        }

        return rendered_field

    def _render_incident_status(self, form_field: FormField, context: RenderContext | None = None) -> dict[str, Any]:
        options = []
        initial_option: dict | None = None
        for inc_status in self.incident_statuses:
            opt = self._create_option_value(name=inc_status.name, value=inc_status.id)
            options.append(opt)

        if context and context.incident:
            initial_option = self._create_option_value(
                name=context.incident.incident_status.name, value=context.incident.incident_status.id
            )

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
            "optional": True if form_field.requirement_type == RequirementTypeEnum.OPTIONAL else False,
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
            "optional": True if form_field.requirement_type == RequirementTypeEnum.OPTIONAL else False,
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
            "optional": True if form_field.requirement_type == RequirementTypeEnum.OPTIONAL else False,
        }
        if form_field.description:
            block["hint"] = {"type": "plain_text", "text": form_field.description}

        return block

    def _render_block(self, form_field: FormField, context: RenderContext | None = None) -> dict | None:
        match form_field.field.kind:
            case FieldKind.USER_DEFINED:
                return self._render_generic_input(form_field=form_field, context=context)
            case FieldKind.INCIDENT_NAME:
                return self._render_text(form_field=form_field, context=context)
            case FieldKind.INCIDENT_SEVERITY:
                return self._render_severity_type(form_field=form_field, context=context)
            case FieldKind.INCIDENT_STATUS:
                return self._render_incident_status(form_field=form_field, context=context)
            case FieldKind.INCIDENT_SUMMARY:
                return self._render_multi_line_text(form_field=form_field, context=context)
            case FieldKind.INCIDENT_TYPE:
                return self._render_incident_type(form_field=form_field, context=context)
            case FieldKind.INCIDENT_INITIAL_STATUS:
                return self._render_initial_incident_status(form_field=form_field, context=context)
            case _:
                raise RuntimeError(f"Unknown field kind {form_field.form.kind}")

    def _render_generic_input(self, form_field: FormField, context: RenderContext | None):
        block = {
            "type": "input",
            "block_id": f"block-{form_field.id}",
            "label": {
                "type": "plain_text",
                "text": form_field.label,
            },
            "optional": True if form_field.requirement_type == RequirementTypeEnum.OPTIONAL else False,
            "dispatch_action": True,
        }

        match form_field.field.interface_kind:
            case InterfaceKind.SINGLE_SELECT:
                block["element"] = self._render_select_element(form_field=form_field, context=context)
            case InterfaceKind.TEXTAREA:
                block["element"] = self._render_multi_line_element(form_field=form_field, context=context)
            case InterfaceKind.TEXT:
                block["element"] = self._render_text_element(form_field=form_field, context=context)

        if form_field.description:
            block["hint"] = {"type": "plain_text", "text": form_field.description}

        return block

    def _create_option_value(self, name: str, value: str) -> dict[str, Any]:
        """Create an option value for use in an select input"""
        return {
            "text": {
                "type": "plain_text",
                "text": name,
            },
            "value": value,
        }

    def _render_select_element(self, form_field: FormField, context: RenderContext | None = None) -> dict[str, Any]:
        options = []
        initial_option: dict | None = None

        if form_field.field.available_options:
            for option_value in form_field.field.available_options:
                opt = self._create_option_value(name=option_value, value=option_value)
                options.append(opt)

        if form_field.default_value:
            initial_option = self._create_option_value(name=form_field.default_value, value=form_field.default_value)

        element: dict[str, Any] = {
            "type": "static_select",
            "action_id": form_field.id,
            "options": options,
        }

        if initial_option:
            element["initial_option"] = initial_option

        return element

    def _render_multi_line_element(self, form_field: FormField, context: RenderContext | None = None) -> dict[str, Any]:
        block = {
            "type": "plain_text_input",
            "multiline": True,
            "action_id": form_field.id,
            "initial_value": form_field.default_value if form_field.default_value else "",
        }

        return block

    def _render_text_element(self, form_field: FormField, context: RenderContext | None = None) -> dict[str, Any]:
        block = {
            "type": "plain_text_input",
            "multiline": False,
            "action_id": form_field.id,
            "initial_value": form_field.default_value if form_field.default_value else "",
        }

        return block
