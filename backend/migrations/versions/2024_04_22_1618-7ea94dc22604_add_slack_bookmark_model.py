"""add slack bookmark model

Revision ID: 7ea94dc22604
Revises: 811b69c66d49
Create Date: 2024-04-22 16:18:41.181057

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "7ea94dc22604"
down_revision: Union[str, None] = "811b69c66d49"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "slack_bookmark",
        sa.Column("organisation_id", sa.String(length=50), nullable=False),
        sa.Column("slack_bookmark_id", sa.UnicodeText(), nullable=False),
        sa.Column("slack_channel_id", sa.UnicodeText(), nullable=False),
        sa.Column(
            "kind", sa.Enum("HOMEPAGE", "LEAD", "STATUS", name="slackbookmarkkind", native_enum=False), nullable=False
        ),
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["organisation_id"], ["organisation.id"], ondelete="cascade"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_slack_bookmark_organisation_id"), "slack_bookmark", ["organisation_id"], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_slack_bookmark_organisation_id"), table_name="slack_bookmark")
    op.drop_table("slack_bookmark")
    # ### end Alembic commands ###
