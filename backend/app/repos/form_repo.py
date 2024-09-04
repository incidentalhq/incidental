from typing import Sequence

from sqlalchemy import func, select

from app.exceptions import ValidationError
from app.models import (
    Field,
    Form,
    FormField,
    FormKind,
    Organisation,
    RequirementTypeEnum,
)
from app.schemas.actions import PatchFormFieldsSchema, PatchSingleFormFieldSchema

from .base_repo import BaseRepo


class FormRepo(BaseRepo):
    def search_forms(self, organisation: Organisation) -> Sequence[Form]:
        stmt = select(Form).where(Form.organisation_id == organisation.id, Form.is_published.is_(True))

        return self.session.scalars(stmt).all()

    def create_form(self, organisation: Organisation, name: str, form_type: FormKind) -> Form:
        form = Form()
        form.organisation_id = organisation.id
        form.name = name
        form.type = form_type
        form.is_published = True

        self.session.add(form)
        self.session.flush()

        return form

    def create_form_field(
        self,
        form: Form,
        field: Field,
        label: str,
        requirement_type: RequirementTypeEnum,
        rank: int | None = None,
        description: str | None = None,
        is_deletable: bool = True,
        can_have_default_value: bool = True,
        can_have_description: bool = True,
        can_change_requirement_type: bool = True,
    ) -> FormField:
        model = FormField()
        model.form_id = form.id
        model.field_id = field.id
        model.label = label
        model.description = description
        model.requirement_type = requirement_type
        model.is_deletable = is_deletable
        model.can_have_default_value = can_have_default_value
        model.can_have_description = can_have_description
        model.can_change_requirement_type = can_change_requirement_type

        if rank is not None:
            model.rank = rank
        else:
            next_rank_stmt = select(func.max(FormField.rank)).where(FormField.form_id == form.id)
            rank = self.session.scalar(next_rank_stmt)
            model.rank = rank + 1 if rank else 0

        self.session.add(model)
        self.session.flush()

        return model

    def get_form(self, organisation: Organisation, form_type: FormKind) -> Form | None:
        stmt = select(Form).where(Form.organisation_id == organisation.id, Form.type == form_type).limit(1)

        return self.session.scalars(stmt).first()

    def get_form_by_id(self, id: str) -> Form | None:
        stmt = select(Form).where(Form.id == id, Form.deleted_at.is_(None)).limit(1)
        return self.session.scalars(stmt).first()

    def get_form_by_id_or_raise(self, id: str) -> Form:
        stmt = select(Form).where(Form.id == id, Form.deleted_at.is_(None)).limit(1)
        return self.session.scalars(stmt).one()

    def get_form_field_by_label(self, form: Form, label: str) -> FormField | None:
        stmt = (
            select(FormField)
            .join(Form)
            .where(FormField.form_id == form.id, Form.deleted_at.is_(None), FormField.label == label)
            .limit(1)
        )

        return self.session.scalar(stmt)

    def get_form_field_by_id(self, id: str) -> FormField | None:
        stmt = select(FormField).join(Form).where(FormField.id == id, Form.deleted_at.is_(None)).limit(1)

        return self.session.scalar(stmt)

    def get_form_field_by_id_or_raise(self, id: str) -> FormField:
        stmt = select(FormField).join(Form).where(FormField.id == id, Form.deleted_at.is_(None)).limit(1)
        return self.session.scalars(stmt).one()

    def patch_form_fields(self, form: Form, patch_in: PatchFormFieldsSchema):
        """Patch multiple form fields"""
        for field in patch_in.root:
            form_field = self.get_form_field_by_id(id=field.id)
            if not form_field:
                raise ValidationError("Form field does not exist")

            if field.rank is not None:
                form_field.rank = field.rank

        self.session.flush()

    def patch_form_field(self, form_field: FormField, patch_in: PatchSingleFormFieldSchema):
        """Patch single form field"""
        ignore = ["id"]
        for field, value in patch_in.model_dump(exclude_unset=True).items():
            if field not in ignore:
                setattr(form_field, field, value)

        self.session.flush()

    def delete_form_field(self, form_field: FormField):
        self.session.delete(form_field)
        self.session.flush()
