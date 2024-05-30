from typing import Any

import structlog

from app.models import Form, FormField, User
from app.schemas.slack import SlackInteractionSchema

logger = structlog.get_logger(logger_name=__name__)


class BaseForm:
    def render(self) -> dict[str, Any]:
        raise NotImplementedError()

    def get_field_value(self, form: Form, interaction: SlackInteractionSchema, field_name: str) -> str:
        field: FormField | None = None
        for it in form.form_fields:
            if it.name == field_name:
                field = it
                break
        if not field:
            raise RuntimeError(f"Could not find form field {field_name}")

        form_state_values = interaction.payload["view"]["state"]["values"]
        field_data = form_state_values[f"block-{field.id}"][field.id]

        if "selected_option" in field_data:
            return field_data["selected_option"]["value"]
        elif "value" in field_data:
            return field_data["value"]

        raise Exception("Unknown state field type")
