import json
import re
from datetime import date, datetime
from typing import Any, AsyncGenerator

from sqlalchemy import Integer, create_engine
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


def to_snake_case(name: str) -> str:
    name = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
    name = re.sub("__([A-Z])", r"_\1", name)
    name = re.sub("([a-z0-9])([A-Z])", r"\1_\2", name)
    return name.lower()


class Base(DeclarativeBase):
    __name__: str  # class name

    @declared_attr
    def __tablename__(cls) -> str:
        return to_snake_case(cls.__name__)

    id: Mapped[int] = mapped_column(Integer(), primary_key=True)


async def get_db() -> AsyncGenerator[Session, None]:
    """Get db session"""
    try:
        db: Session = session_factory()
        yield db
    finally:
        db.close()
