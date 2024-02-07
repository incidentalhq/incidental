"""initial

Revision ID: deef44a368e5
Revises: 
Create Date: 2024-01-30 17:08:44.600054

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "deef44a368e5"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "organisation",
        sa.Column("name", sa.UnicodeText(), nullable=False),
        sa.Column("kind", sa.UnicodeText(), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("slack_team_id", sa.UnicodeText(), nullable=True),
        sa.Column("slack_team_name", sa.UnicodeText(), nullable=True),
        sa.Column("slack_bot_token", sa.UnicodeText(), nullable=True),
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slack_team_id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_table(
        "user",
        sa.Column("name", sa.UnicodeText(), nullable=False),
        sa.Column("email_address", sa.UnicodeText(), nullable=False),
        sa.Column("password", sa.UnicodeText(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("auth_token", sa.UnicodeText(), nullable=False),
        sa.Column("is_super_admin", sa.Boolean(), nullable=True),
        sa.Column("is_billing_user", sa.Boolean(), nullable=True),
        sa.Column("language", sa.UnicodeText(), nullable=False),
        sa.Column("settings", postgresql.JSONB(none_as_null=True, astext_type=sa.Text()), nullable=False),
        sa.Column("is_email_verified", sa.Boolean(), nullable=False),
        sa.Column("login_attempts", sa.Integer(), nullable=False),
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
        sa.Column("last_login_attempt_at", sa.DateTime(), nullable=True),
        sa.Column("slack_user_id", sa.UnicodeText(), nullable=True),
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("auth_token"),
        sa.UniqueConstraint("email_address"),
        sa.UniqueConstraint("slack_user_id"),
    )
    op.create_table(
        "custom_field",
        sa.Column("organisation_id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.UnicodeText(), nullable=False),
        sa.Column("description", sa.UnicodeText(), nullable=True),
        sa.Column(
            "kind",
            sa.Enum("SINGLE_SELECT", "MULTI_SELECT", "TEXT", "TEXTAREA", name="customfieldkind", native_enum=False),
            nullable=False,
        ),
        sa.Column("available_options", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["organisation_id"], ["organisation.id"], ondelete="cascade"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_custom_field_organisation_id"), "custom_field", ["organisation_id"], unique=False)
    op.create_table(
        "form",
        sa.Column("organisation_id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.UnicodeText(), nullable=False),
        sa.Column("is_published", sa.Boolean(), nullable=False),
        sa.Column("template", sa.UnicodeText(), nullable=True),
        sa.Column(
            "type", sa.Enum("CREATE_INCIDENT", "UPDATE_INCIDENT", name="formtype", native_enum=False), nullable=False
        ),
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["organisation_id"], ["organisation.id"], ondelete="cascade"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_form_organisation_id"), "form", ["organisation_id"], unique=False)
    op.create_table(
        "incident_severity",
        sa.Column("organisation_id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.UnicodeText(), nullable=False),
        sa.Column("description", sa.UnicodeText(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["organisation_id"], ["organisation.id"], ondelete="cascade"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_incident_severity_organisation_id"), "incident_severity", ["organisation_id"], unique=False
    )
    op.create_table(
        "incident_status",
        sa.Column("organisation_id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.UnicodeText(), nullable=False),
        sa.Column("description", sa.UnicodeText(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["organisation_id"], ["organisation.id"], ondelete="cascade"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_incident_status_organisation_id"), "incident_status", ["organisation_id"], unique=False)
    op.create_table(
        "incident_type",
        sa.Column("organisation_id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.UnicodeText(), nullable=False),
        sa.Column("description", sa.UnicodeText(), nullable=False),
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["organisation_id"], ["organisation.id"], ondelete="cascade"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_incident_type_organisation_id"), "incident_type", ["organisation_id"], unique=False)
    op.create_table(
        "organisation_member",
        sa.Column("user_id", sa.String(length=50), nullable=False),
        sa.Column("organisation_id", sa.String(length=50), nullable=False),
        sa.Column("role", sa.UnicodeText(), nullable=False),
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["organisation_id"], ["organisation.id"], ondelete="cascade"),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="cascade"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "organisation_id", name="ux_user_organisation"),
    )
    op.create_index(
        op.f("ix_organisation_member_organisation_id"), "organisation_member", ["organisation_id"], unique=False
    )
    op.create_index(op.f("ix_organisation_member_user_id"), "organisation_member", ["user_id"], unique=False)
    op.create_table(
        "form_field",
        sa.Column("form_id", sa.String(length=50), nullable=False),
        sa.Column("custom_field_id", sa.String(length=50), nullable=True),
        sa.Column(
            "kind",
            sa.Enum(
                "SINGLE_SELECT",
                "MULTI_SELECT",
                "TEXT",
                "TEXTAREA",
                "INCIDENT_TYPE",
                "SEVERITY_TYPE",
                name="formfieldkind",
                native_enum=False,
            ),
            nullable=False,
        ),
        sa.Column("name", sa.UnicodeText(), nullable=False),
        sa.Column("description", sa.UnicodeText(), nullable=True),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("is_required", sa.Boolean(), nullable=False),
        sa.Column("default_value", sa.UnicodeText(), nullable=True),
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["custom_field_id"], ["custom_field.id"], ondelete="cascade"),
        sa.ForeignKeyConstraint(["form_id"], ["form.id"], ondelete="cascade"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_form_field_custom_field_id"), "form_field", ["custom_field_id"], unique=False)
    op.create_index(op.f("ix_form_field_form_id"), "form_field", ["form_id"], unique=False)
    op.create_table(
        "incident",
        sa.Column("organisation_id", sa.String(length=50), nullable=False),
        sa.Column("incident_type_id", sa.String(length=50), nullable=False),
        sa.Column("incident_status_id", sa.String(length=50), nullable=False),
        sa.Column("creator_id", sa.String(length=50), nullable=False),
        sa.Column("incident_severity_id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.UnicodeText(), nullable=False),
        sa.Column("reference", sa.UnicodeText(), nullable=False),
        sa.Column("slack_channel_id", sa.UnicodeText(), nullable=False),
        sa.Column("slack_channel_name", sa.UnicodeText(), nullable=False),
        sa.Column("id", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["creator_id"], ["user.id"], ondelete="cascade"),
        sa.ForeignKeyConstraint(["incident_severity_id"], ["incident_severity.id"], ondelete="cascade"),
        sa.ForeignKeyConstraint(["incident_status_id"], ["incident_status.id"], ondelete="cascade"),
        sa.ForeignKeyConstraint(["incident_type_id"], ["incident_type.id"], ondelete="cascade"),
        sa.ForeignKeyConstraint(["organisation_id"], ["organisation.id"], ondelete="cascade"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_incident_creator_id"), "incident", ["creator_id"], unique=False)
    op.create_index(op.f("ix_incident_incident_severity_id"), "incident", ["incident_severity_id"], unique=False)
    op.create_index(op.f("ix_incident_incident_status_id"), "incident", ["incident_status_id"], unique=False)
    op.create_index(op.f("ix_incident_incident_type_id"), "incident", ["incident_type_id"], unique=False)
    op.create_index(op.f("ix_incident_organisation_id"), "incident", ["organisation_id"], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_incident_organisation_id"), table_name="incident")
    op.drop_index(op.f("ix_incident_incident_type_id"), table_name="incident")
    op.drop_index(op.f("ix_incident_incident_status_id"), table_name="incident")
    op.drop_index(op.f("ix_incident_incident_severity_id"), table_name="incident")
    op.drop_index(op.f("ix_incident_creator_id"), table_name="incident")
    op.drop_table("incident")
    op.drop_index(op.f("ix_form_field_form_id"), table_name="form_field")
    op.drop_index(op.f("ix_form_field_custom_field_id"), table_name="form_field")
    op.drop_table("form_field")
    op.drop_index(op.f("ix_organisation_member_user_id"), table_name="organisation_member")
    op.drop_index(op.f("ix_organisation_member_organisation_id"), table_name="organisation_member")
    op.drop_table("organisation_member")
    op.drop_index(op.f("ix_incident_type_organisation_id"), table_name="incident_type")
    op.drop_table("incident_type")
    op.drop_index(op.f("ix_incident_status_organisation_id"), table_name="incident_status")
    op.drop_table("incident_status")
    op.drop_index(op.f("ix_incident_severity_organisation_id"), table_name="incident_severity")
    op.drop_table("incident_severity")
    op.drop_index(op.f("ix_form_organisation_id"), table_name="form")
    op.drop_table("form")
    op.drop_index(op.f("ix_custom_field_organisation_id"), table_name="custom_field")
    op.drop_table("custom_field")
    op.drop_table("user")
    op.drop_table("organisation")
    # ### end Alembic commands ###
