from pydantic import EmailStr, constr

from .base import BaseSchema


class AuthUserSchema(BaseSchema):
    email_address: EmailStr
    password: str


class CreateUserSchema(BaseSchema):
    name: str
    email_address: EmailStr
    password: constr(min_length=8)
