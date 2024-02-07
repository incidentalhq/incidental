from sqlalchemy import select

from app.models import Form, FormField, Organisation
from app.models.form import FormType
from app.models.form_field import FormFieldKind

from .base_repo import BaseRepo


class FormRepo(BaseRepo):
    def search_forms(self, organisation: Organisation) -> list[Form]:
        stmt = select(Form).where(Form.organisation_id == organisation.id, Form.is_published.is_(True))

        return self.session.scalars(stmt).all()

    def create_form(self, organisation: Organisation, name: str, _type: FormType) -> Form:
        form = Form()
        form.organisation_id = organisation.id
        form.name = name
        form.type = _type

        self.session.add(form)
        self.session.flush()

        return form

    def create_form_field(
        self, form: Form, name: str, kind: FormFieldKind, position: int = 0, description: str = ""
    ) -> FormField:
        ff = FormField()
        ff.form_id = form.id
        ff.name = name
        ff.kind = kind
        ff.position = position
        ff.description = description

        self.session.add(ff)
        self.session.flush()

        return ff

    def get_form(self, organisation: Organisation, form_type: FormType) -> Form | None:
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
