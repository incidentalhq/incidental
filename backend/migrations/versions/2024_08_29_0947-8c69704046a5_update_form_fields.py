"""update form fields

Revision ID: 8c69704046a5
Revises: 7a2a8fd88e5c
Create Date: 2024-08-29 09:47:46.832492

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "8c69704046a5"
down_revision: Union[str, None] = "7a2a8fd88e5c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "field",
        "kind",
        existing_type=sa.VARCHAR(length=24),
        type_=sa.Enum(
            "USER_DEFINED",
            "INCIDENT_NAME",
            "INCIDENT_TYPE",
            "INCIDENT_SEVERITY",
            "INCIDENT_STATUS",
            "INCIDENT_SUMMARY",
            "INCIDENT_INITIAL_STATUS",
            name="fieldkind",
            native_enum=False,
        ),
        existing_nullable=False,
    )

    op.add_column(
        "form_field",
        sa.Column(
            "requirement_type",
            sa.Enum("OPTIONAL", "REQUIRED", "CONDITIONAL", name="requirementtypeenum", native_enum=False),
            nullable=True,
        ),
    )
    op.execute("""
    UPDATE form_field
    SET requirement_type = CASE
        WHEN is_required = TRUE THEN 'REQUIRED'
        ELSE 'OPTIONAL'
    END
    """)
    op.alter_column("form_field", "requirement_type", nullable=False)

    op.add_column(
        "form_field", sa.Column("can_have_default_value", sa.Boolean(), server_default=sa.text("false"), nullable=False)
    )
    op.add_column(
        "form_field", sa.Column("can_have_description", sa.Boolean(), server_default=sa.text("false"), nullable=False)
    )
    op.add_column(
        "form_field",
        sa.Column("can_change_requirement_type", sa.Boolean(), server_default=sa.text("false"), nullable=False),
    )
    op.drop_column("form_field", "is_required")
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("form_field", sa.Column("is_required", sa.BOOLEAN(), autoincrement=False, nullable=True))
    # Update is_required based on requirement_status
    op.execute("""
    UPDATE form_field
    SET is_required = (requirement_type = 'REQUIRED')
    """)
    op.alter_column("form_field", "is_required", nullable=False)

    op.drop_column("form_field", "can_change_requirement_type")
    op.drop_column("form_field", "can_have_description")
    op.drop_column("form_field", "can_have_default_value")
    op.drop_column("form_field", "requirement_type")
    op.alter_column(
        "field",
        "kind",
        existing_type=sa.Enum(
            "USER_DEFINED",
            "INCIDENT_NAME",
            "INCIDENT_TYPE",
            "INCIDENT_SEVERITY",
            "INCIDENT_STATUS",
            "INCIDENT_SUMMARY",
            "INCIDENT_INITIAL_STATUS",
            name="fieldkind",
            native_enum=False,
        ),
        type_=sa.VARCHAR(length=24),
        existing_nullable=False,
    )
    # ### end Alembic commands ###
