import pytest
from alembic import command
from alembic.config import Config

from app.db import Base, engine, session_factory


@pytest.fixture(scope="session")
def db():
    try:
        db = session_factory()
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def clear_db():
    """Truncate all tables between db tests"""
    with engine.connect() as connection:
        tx = connection.begin()
        for table in reversed(Base.metadata.sorted_tables):
            connection.execute(table.delete())
        tx.commit()


@pytest.fixture(scope="session", autouse=True)
def setup_database() -> None:
    """Setup all the tables in the database"""
    alembic_config = Config("/srv/alembic.ini")
    command.upgrade(alembic_config, revision="head")
