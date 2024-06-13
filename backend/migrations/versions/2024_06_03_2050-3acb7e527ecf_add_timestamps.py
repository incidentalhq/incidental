"""add timestamps

Revision ID: 3acb7e527ecf
Revises: 91a050e23239
Create Date: 2024-06-03 20:50:04.030991

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "3acb7e527ecf"
down_revision: Union[str, None] = "91a050e23239"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "timestamp",
        sa.Column("organisation_id", sa.String(length=50), nullable=False),
        sa.Column("label", sa.UnicodeText(), nullable=False),
        sa.Column(
            "kind",
            sa.Enum(
                "REPORTED_AT",
                "ACCEPTED_AT",
                "DECLINED_AT",
                "MERGED_AT",
                "CANCELLED_AT",
                "RESOLVED_AT",
                "CLOSED_AT",
                "CUSTOM",
                name="timestampkind",
                native_enum=False,
            ),
            nullable=False,
        ),
        sa.Column("rank", sa.Integer(), nullable=False),
        sa.Column("rules", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["organisation_id"], ["organisation.id"], ondelete="cascade"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_timestamp_organisation_id"), "timestamp", ["organisation_id"], unique=False)
    op.create_table(
        "timestamp_value",
        sa.Column("timestamp_id", sa.String(length=50), nullable=False),
        sa.Column("incident_id", sa.String(length=50), nullable=False),
        sa.Column("value", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["incident_id"], ["incident.id"], ondelete="cascade"),
        sa.ForeignKeyConstraint(["timestamp_id"], ["timestamp.id"], ondelete="cascade"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_timestamp_value_incident_id"), "timestamp_value", ["incident_id"], unique=False)
    op.create_index(op.f("ix_timestamp_value_timestamp_id"), "timestamp_value", ["timestamp_id"], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_timestamp_value_timestamp_id"), table_name="timestamp_value")
    op.drop_index(op.f("ix_timestamp_value_incident_id"), table_name="timestamp_value")
    op.drop_table("timestamp_value")
    op.drop_index(op.f("ix_timestamp_organisation_id"), table_name="timestamp")
    op.drop_table("timestamp")
    # ### end Alembic commands ###
