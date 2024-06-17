import pytest

from app.db import Base, engine


@pytest.fixture(autouse=True)
def clear_db():
    """Truncate all tables between db tests"""
    with engine.connect() as connection:
        tx = connection.begin()
        for table in reversed(Base.metadata.sorted_tables):  # pylint: disable=no-member
            connection.execute(table.delete())
        tx.commit()
