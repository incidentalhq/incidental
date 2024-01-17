import json
from datetime import date, datetime
from typing import Any, AsyncGenerator

from pydantic.alias_generators import to_snake
from shortuuid import uuid
from sqlalchemy import String, create_engine
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    declared_attr,
    mapped_column,
    sessionmaker,
)
from sqlalchemy.orm.session import Session

from app.env import settings


def _default(val: Any) -> Any:
    if isinstance(val, date):
        return val.isoformat()
    if isinstance(val, datetime):
        return val.isoformat()
    return val


def serializer(val: Any) -> str:
    return json.dumps(val, default=_default)


postgres_dsn = f"postgresql://{settings.DATABASE_USER}:{settings.DATABASE_PASSWORD}@{settings.DATABASE_HOST}:{settings.DATABASE_PORT}/{settings.DATABASE_NAME}"
engine = create_engine(postgres_dsn, json_serializer=serializer)
session_factory = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    __name__: str  # class name
    __prefix__: str  # prefix used for record IDs

    @declared_attr.directive
    def __tablename__(cls) -> str:
        return to_snake(cls.__name__)

    @declared_attr
    def id(cls):
        return mapped_column(
            String(50), primary_key=True, default=lambda: f"{cls.__prefix__}_{uuid()}"
        )


async def get_db(commit_at_close: bool = False) -> AsyncGenerator[Session, None]:
    """Get db session"""
    try:
        db: Session = session_factory()
        yield db

        if commit_at_close:
            db.commit()
    finally:
        db.close()
