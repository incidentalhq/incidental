"""role columns

Revision ID: cf938c4d09fd
Revises: 23b6b5a10947
Create Date: 2024-06-29 19:31:19.257939

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "cf938c4d09fd"
down_revision: Union[str, None] = "23b6b5a10947"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("incident_role", sa.Column("is_deletable", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column("incident_role", sa.Column("is_editable", sa.Boolean(), nullable=False, server_default=sa.true()))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("incident_role", "is_editable")
    op.drop_column("incident_role", "is_deletable")
    # ### end Alembic commands ###