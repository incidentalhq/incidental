from typing import Optional

from pydantic import BaseModel


def to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


def convert_to_optional(schema: BaseModel) -> dict:
    return {k: Optional[v] for k, v in schema.__annotations__.items()}


class BaseSchema(BaseModel):
    class Config:
        alias_generator = to_camel
        from_attributes = True
        populate_by_name = True
        extra = "forbid"


class ModelSchema(BaseSchema):
    public_id: str
