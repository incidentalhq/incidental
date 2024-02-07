from sqlalchemy.orm import Session


class BaseRepo:
    def __init__(self, session: Session):
        self.session = session
