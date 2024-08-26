"""form field abilities

Revision ID: ba126000ca27
Revises: 7a2a8fd88e5c
Create Date: 2024-08-25 20:39:25.226124

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "ba126000ca27"
down_revision: Union[str, None] = "7a2a8fd88e5c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "form_field", sa.Column("can_have_default_value", sa.Boolean(), server_default=sa.text("false"), nullable=False)
    )
    op.add_column(
        "form_field", sa.Column("can_have_description", sa.Boolean(), server_default=sa.text("false"), nullable=False)
    )
    op.add_column(
        "form_field", sa.Column("can_change_required", sa.Boolean(), server_default=sa.text("false"), nullable=False)
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("form_field", "can_change_required")
    op.drop_column("form_field", "can_have_description")
    op.drop_column("form_field", "can_have_default_value")
    # ### end Alembic commands ###
