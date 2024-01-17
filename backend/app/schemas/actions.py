from typing import Any, Literal, Union

from pydantic import ConfigDict, EmailStr, constr

from .base import BaseSchema


class AuthUserSchema(BaseSchema):
    email_address: EmailStr
    password: str


class CreateUserSchema(BaseSchema):
    name: str
    email_address: EmailStr
    password: constr(min_length=8)


class SlackEventsSchema(BaseSchema):
    token: str
    challenge: str | None = None
    type: str = Union[Literal["url_verification"], Literal["event_callback"]]
    event: dict[str, Any]

    model_config = ConfigDict(extra="allow")
