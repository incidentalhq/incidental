from .base import BaseSchema
from .models import FieldSchema, IncidentFieldValueSchema


class CombinedFieldAndValueSchema(BaseSchema):
    field: FieldSchema
    value: IncidentFieldValueSchema | None
