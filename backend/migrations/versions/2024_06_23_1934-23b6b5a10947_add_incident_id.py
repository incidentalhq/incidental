"""add incident id

Revision ID: 23b6b5a10947
Revises: b40753c385bc
Create Date: 2024-06-23 19:34:21.455969

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "23b6b5a10947"
down_revision: Union[str, None] = "b40753c385bc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("incident", sa.Column("reference_id", sa.Integer(), nullable=True))

    # backfill data
    op.execute(sa.text("UPDATE incident SET reference_id = CAST(SUBSTRING(reference FROM 5) AS INTEGER)"))
    op.alter_column("incident", "reference_id", nullable=False)

    op.create_unique_constraint(
        "ux_incident_reference_id_organisation_id", "incident", ["reference_id", "organisation_id"]
    )
    op.alter_column("user", "is_super_admin", existing_type=sa.BOOLEAN(), nullable=False)
    op.alter_column("user", "is_billing_user", existing_type=sa.BOOLEAN(), nullable=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column("user", "is_billing_user", existing_type=sa.BOOLEAN(), nullable=True)
    op.alter_column("user", "is_super_admin", existing_type=sa.BOOLEAN(), nullable=True)
    op.drop_constraint("ux_incident_reference_id_organisation_id", "incident", type_="unique")
    op.drop_column("incident", "reference_id")
    # ### end Alembic commands ###