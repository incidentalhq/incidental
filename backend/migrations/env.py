import os
from logging.config import fileConfig

from alembic import context
from alembic.autogenerate import rewriter
from alembic.operations import ops
from sqlalchemy import Column, create_engine

from app.db import Base
from app.models import *  # noqa: F403, F401

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata

writer = rewriter.Rewriter()


@writer.rewrites(ops.CreateTableOp)
def order_columns(context, revision, op):
    special_names = {"id": -100, "created_at": 1001, "updated_at": 1002}

    cols_by_key = [
        (
            special_names.get(col.key, index) if isinstance(col, Column) else 2000,
            col.copy(),
        )
        for index, col in enumerate(op.columns)
    ]

    columns = [col for idx, col in sorted(cols_by_key, key=lambda entry: entry[0])]
    return ops.CreateTableOp(
        op.table_name,
        columns,
        schema=op.schema,
        _namespace_metadata=op._namespace_metadata,
        _constraints_included=op._constraints_included,
        **op.kw,
    )


def get_url() -> str:
    return "postgresql://%s:%s@%s:%s/%s" % (
        os.getenv("DATABASE_USER"),
        os.getenv("DATABASE_PASSWORD"),
        os.getenv("DATABASE_HOST"),
        os.getenv("DATABASE_PORT"),
        os.getenv("DATABASE_NAME"),
    )


def run_migrations_offline():
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    context.configure(
        url=get_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        process_revision_directives=writer,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = create_engine(get_url())

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, process_revision_directives=writer)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

#    op.execute("drop TYPE componentstatus")
#    op.execute("drop type statuspageincidentstatus")
