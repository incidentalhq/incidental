from typing import Annotated

from pydantic import EmailStr, StringConstraints

from .base import BaseSchema


class AuthUserSchema(BaseSchema):
    email_address: EmailStr
    password: str


class CreateUserSchema(BaseSchema):
    name: str
    email_address: EmailStr
    password: Annotated[str, StringConstraints(min_length=8)]
    slack_user_id: str | None = None
    is_email_verified: bool = False


class OAuth2AuthorizationResultSchema(BaseSchema):
    code: str


class PaginationParamsSchema(BaseSchema):
    page: int = 1
    size: int = 25


class IncidentSearchSchema(PaginationParamsSchema):
    q: str | None = None
