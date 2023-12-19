from datetime import datetime
from typing import Generic, List, TypeVar

from pydantic import BaseModel, EmailStr

from app.schemas.base import BaseSchema

DataT = TypeVar("DataT")


class OrganisationSchema(BaseSchema):
    public_id: str
    name: str
    kind: str


class UserSchema(BaseSchema):
    name: str
    email_address: EmailStr
    auth_token: str
    is_super_admin: bool
    last_login_at: datetime


class UserPublicSchema(BaseSchema):
    name: str
    email_address: EmailStr


class PublicUserSchema(BaseSchema):
    name: str
    email_address: str


class WorldSchema(BaseSchema):
    user: UserSchema


class PaginatedResults(BaseModel, Generic[DataT]):
    total: int
    page: int
    size: int
    items: List[DataT]

    class Config:
        arbitrary_types_allowed = True


class FileSchema(BaseSchema):
    id: int
