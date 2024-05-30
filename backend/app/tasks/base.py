from abc import ABC, abstractmethod
from typing import Generic, TypeVar

from pydantic import BaseModel
from sqlalchemy.orm import Session

Parameters = TypeVar("Parameters", bound=BaseModel)


class BaseTask(ABC, Generic[Parameters]):
    def __init__(self, session: Session):
        self.session = session

    @abstractmethod
    def execute(self, parameters: Parameters):
        pass
