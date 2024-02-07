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
    slack_user_id: str | None = None
    is_email_verified: bool = False


class SlackEventsSchema(BaseSchema):
    token: str
    challenge: str | None = None
    type: str = Union[Literal["url_verification"], Literal["event_callback"]]
    event: dict[str, Any]

    model_config = ConfigDict(extra="allow")


class OAuth2AuthorizationResultSchema(BaseSchema):
    code: str


class PaginationParamsSchema(BaseSchema):
    page: int = 1
    size: int = 25


class IncidentSearchSchema(PaginationParamsSchema):
    q: str | None = None
