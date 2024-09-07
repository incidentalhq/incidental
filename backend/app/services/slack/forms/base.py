from typing import Any

import structlog

from app.models import Form
from app.schemas.slack import SlackInteractionSchema

logger = structlog.get_logger(logger_name=__name__)


class BaseForm:
    def render(self) -> dict[str, Any]:
        raise NotImplementedError()

    def get_form_values(self, form: Form, interaction: SlackInteractionSchema) -> dict[str, Any]:
        values = {}
        form_state_values = interaction.payload["view"]["state"]["values"]

        for ff in form.form_fields:
            field_data = form_state_values[f"block-{ff.id}"][ff.id]
            value = None
            if "selected_option" in field_data:
                value = field_data["selected_option"]["value"]
            elif "value" in field_data:
                value = field_data["value"]

            values[ff.id] = value

        return values
