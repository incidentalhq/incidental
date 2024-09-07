"""rename positon -> rank

Revision ID: 7a2a8fd88e5c
Revises: 2c714795f8fe
Create Date: 2024-08-25 19:24:13.444106

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "7a2a8fd88e5c"
down_revision: Union[str, None] = "2c714795f8fe"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("form_field", "position", new_column_name="rank")


def downgrade() -> None:
    op.alter_column("form_field", "rank", new_column_name="position")
