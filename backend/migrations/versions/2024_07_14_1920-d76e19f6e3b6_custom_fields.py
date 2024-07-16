"""custom fields

Revision ID: d76e19f6e3b6
Revises: 7e5d07b95d98
Create Date: 2024-07-14 19:20:05.591056

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "d76e19f6e3b6"
down_revision: Union[str, None] = "7e5d07b95d98"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("custom_field", column_name="kind", new_column_name="interface_kind")
    op.execute(sa.text("truncate table custom_field cascade"))
    op.add_column(
        "custom_field",
        sa.Column(
            "kind",
            sa.Enum(
                "USER_DEFINED",
                "INCIDENT_NAME",
                "INCIDENT_TYPE",
                "INCIDENT_SEVERITY",
                "INCIDENT_STATUS",
                "INCIDENT_SUMMARY",
                name="fielddatasource",
                native_enum=False,
            ),
            nullable=False,
        ),
    )
    op.add_column("custom_field", sa.Column("is_deletable", sa.Boolean(), nullable=False))
    op.add_column("custom_field", sa.Column("is_editable", sa.Boolean(), nullable=False))
    op.alter_column("custom_field", column_name="name", new_column_name="label")
    op.drop_column("form_field", "name")
    op.drop_column("form_field", "kind")

    # rename custom_field -> field
    op.rename_table("custom_field", "field")
    op.alter_column("form_field", column_name="custom_field_id", nullable=False)
    op.alter_column("form_field", column_name="custom_field_id", new_column_name="field_id")


def downgrade() -> None:
    op.alter_column("form_field", column_name="field_id", new_column_name="custom_field_id")
    op.rename_table("field", "custom_field")
    op.alter_column("form_field", column_name="custom_field_id", nullable=True)
    op.add_column("form_field", sa.Column("name", sa.String, nullable=True))
    op.add_column("form_field", sa.Column("kind", sa.String, nullable=True))
    op.drop_column("custom_field", "is_editable")
    op.drop_column("custom_field", "is_deletable")
    op.drop_column("custom_field", "kind")
    op.alter_column("custom_field", column_name="label", new_column_name="name")
    op.alter_column("custom_field", column_name="interface_kind", new_column_name="kind")
