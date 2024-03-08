"""add fields to slack messsage

Revision ID: 29efd1d2c977
Revises: 4ab0568af723
Create Date: 2024-03-08 19:10:14.215712

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "29efd1d2c977"
down_revision: Union[str, None] = "4ab0568af723"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("slack_message", sa.Column("slack_message_ts", sa.UnicodeText(), nullable=False))
    op.add_column("slack_message", sa.Column("slack_channel_id", sa.UnicodeText(), nullable=False))
    op.add_column(
        "slack_message",
        sa.Column("kind", sa.Enum("CHANNEL_PINNED_POST", name="slackmessagekind", native_enum=False), nullable=False),
    )
    op.alter_column("slack_message", "announcement_id", existing_type=sa.VARCHAR(length=50), nullable=True)
    op.drop_column("slack_message", "slack_message_id")
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column("slack_message", sa.Column("slack_message_id", sa.TEXT(), autoincrement=False, nullable=False))
    op.alter_column("slack_message", "announcement_id", existing_type=sa.VARCHAR(length=50), nullable=False)
    op.drop_column("slack_message", "kind")
    op.drop_column("slack_message", "slack_channel_id")
    op.drop_column("slack_message", "slack_message_ts")
    # ### end Alembic commands ###