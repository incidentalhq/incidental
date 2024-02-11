from typing import Optional

from pydantic import BaseModel
from pydantic.alias_generators import to_camel


def convert_to_optional(schema: BaseModel) -> dict:
    return {k: Optional[v] for k, v in schema.__annotations__.items()}


class BaseSchema(BaseModel):
    class Config:
        alias_generator = to_camel
        from_attributes = True
        populate_by_name = True
        extra = "forbid"
