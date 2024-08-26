from typing import Sequence

from sqlalchemy import select

from app.exceptions import ValidationError
from app.models import (
    Field,
    Form,
    FormField,
    FormKind,
    Organisation,
)
from app.schemas.actions import PatchFormFieldsSchema

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
        is_required: bool,
        rank: int = 0,
        description: str | None = None,
        is_deletable: bool = True,
    ) -> FormField:
        model = FormField()
        model.form_id = form.id
        model.field_id = field.id
        model.label = label
        model.rank = rank
        model.description = description
        model.is_required = is_required
        model.is_deletable = is_deletable

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
        stmt = select(FormField).where(FormField.id == id, Form.deleted_at.is_(None)).limit(1)

        return self.session.scalar(stmt)

    def patch_form_fields(self, form: Form, patch_in: PatchFormFieldsSchema):
        for field in patch_in.root:
            form_field = self.get_form_field_by_id(id=field.id)
            if not form_field:
                raise ValidationError("Form field does not exist")

            if field.rank is not None:
                form_field.rank = field.rank

        self.session.flush()
