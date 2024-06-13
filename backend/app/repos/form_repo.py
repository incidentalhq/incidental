from typing import Sequence

from sqlalchemy import select

from app.models import Form, FormField, Organisation
from app.models.form import FormKind
from app.models.form_field import FormFieldKind

from .base_repo import BaseRepo


class FormRepo(BaseRepo):
    def search_forms(self, organisation: Organisation) -> Sequence[Form]:
        stmt = select(Form).where(Form.organisation_id == organisation.id, Form.is_published.is_(True))

        return self.session.scalars(stmt).all()

    def create_form(self, organisation: Organisation, name: str, _type: FormKind) -> Form:
        form = Form()
        form.organisation_id = organisation.id
        form.name = name
        form.type = _type
        form.is_published = True

        self.session.add(form)
        self.session.flush()

        return form

    def create_form_field(
        self,
        form: Form,
        name: str,
        kind: FormFieldKind,
        label: str,
        is_required: bool,
        position: int = 0,
        description: str | None = None,
        is_deletable: bool = True,
    ) -> FormField:
        model = FormField()
        model.form_id = form.id
        model.label = label
        model.name = name
        model.kind = kind
        model.position = position
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

    def get_form_field_by_name(self, form: Form, name: str) -> FormField | None:
        stmt = (
            select(FormField)
            .join(Form)
            .where(FormField.form_id == form.id, Form.deleted_at.is_(None), FormField.name == name)
            .limit(1)
        )

        return self.session.scalar(stmt)
