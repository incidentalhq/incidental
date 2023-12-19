"""empty message

Revision ID: 03d44f6c58b2
Revises: 
Create Date: 2023-08-05 17:48:53.798479

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers, used by Alembic.
revision: str = "03d44f6c58b2"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), nullable=False, primary_key=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("name", sa.UnicodeText(), nullable=False),
        sa.Column("email_address", sa.UnicodeText(), nullable=False),
        sa.Column("password", sa.UnicodeText(), nullable=False),
        sa.Column("auth_token", sa.UnicodeText(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("is_super_admin", sa.Boolean(), nullable=True),
        sa.Column("is_billing_user", sa.Boolean(), nullable=True),
        sa.Column("language", sa.UnicodeText(), nullable=False),
        sa.Column("settings", JSONB(), nullable=False),
        sa.Column("is_email_verified", sa.Boolean(), nullable=False),
        sa.Column("login_attempts", sa.Integer(), nullable=False),
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
        sa.Column("last_login_attempt_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("auth_token"),
        sa.UniqueConstraint("email_address"),
    )


def downgrade() -> None:
    op.drop_table("user")
