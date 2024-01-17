from sqlalchemy import String, UnicodeText
from sqlalchemy.orm import Mapped, backref, mapped_column, relationship

from app.db import Base

from .mixins import TimestampMixin


class OrganisationTypes(object):
    DEFAULT = "default"


class Organisation(Base, TimestampMixin):
    __prefix__ = "org"

    name = mapped_column(UnicodeText, nullable=False)
    kind = mapped_column(UnicodeText, nullable=False, default=OrganisationTypes.DEFAULT)
    slug = mapped_column(String(100), nullable=False, unique=True)

    def __repr__(self):
        return f"<Organisation id={self.id} name={self.name}>"
