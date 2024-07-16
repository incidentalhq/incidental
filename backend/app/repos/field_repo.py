from datetime import datetime, timezone
from typing import Any, Sequence

from sqlalchemy import select

from app.models import (
    Field,
    FieldKind,
    Form,
    FormField,
    InterfaceKind,
    Organisation,
)
from app.schemas.actions import PatchFieldSchema

from .base_repo import BaseRepo


class FieldRepo(BaseRepo):
    def get_form_field_by_label(self, form: Form, label: str) -> FormField | None:
        stmt = (
            select(FormField)
            .join(Form)
            .where(FormField.form_id == form.id, Form.deleted_at.is_(None), FormField.label == label)
            .limit(1)
        )

        return self.session.scalar(stmt)

    def get_form_field_by_id(self, id: str) -> FormField | None:
        stmt = select(FormField).where(FormField.id == id, Form.deleted_at.is_(None)).limit(1)

        return self.session.scalar(stmt)

    def create_field(
        self,
        organisation: Organisation,
        label: str,
        interface_kind: InterfaceKind,
        kind: FieldKind,
        description: str | None = None,
        available_options: list[str] | None = None,
    ) -> Field:
        """Create new field"""
        field = Field()
        field.organisation = organisation
        field.label = label
        field.kind = kind
        field.interface_kind = interface_kind
        field.available_options = available_options
        field.description = description

        if kind == FieldKind.USER_DEFINED:
            field.is_deletable = True
            field.is_editable = True
        else:
            field.is_editable = False
            field.is_deletable = False

        self.session.add(field)
        self.session.flush()

        return field

    def get_field_by_kind(self, organisation: Organisation, kind: FieldKind) -> Field | None:
        """Get a field by kind"""
        stmt = (
            select(Field)
            .where(Field.organisation_id == organisation.id, Field.kind == kind, Field.deleted_at.is_(None))
            .limit(1)
        )

        return self.session.scalar(stmt)

    def get_all_fields(self, organisation: Organisation) -> Sequence[Field]:
        """Get all fields for an organisation"""
        stmt = select(Field).where(Field.organisation_id == organisation.id, Field.deleted_at.is_(None))
        return self.session.scalars(stmt).all()

    def patch_field(self, field: Field, patch_in: PatchFieldSchema) -> None:
        """Patch a field"""
        for key, value in patch_in.model_dump(exclude_unset=True).items():
            setattr(field, key, value)

        self.session.flush()

    def get_field_by_id_or_throw(self, id: str) -> Field:
        """Get field by ID"""
        stmt = select(Field).where(Field.id == id, Field.deleted_at.is_(None)).limit(1)
        return self.session.scalars(stmt).one()

    def soft_delete_field(self, field: Field):
        """Delete field"""
        field.deleted_at = datetime.now(tz=timezone.utc)
        self.session.flush()
