from enum import Enum

from starlette.status import HTTP_403_FORBIDDEN, HTTP_422_UNPROCESSABLE_ENTITY


class ErrorCodes(Enum):
    OVER_QUOTA = "OVER_QUOTA"
    MODEL_NOT_FOUND = "MODEL_NOT_FOUND"
    NOT_ALLOWED = "NOT_ALLOWED"


class ApplicationException(Exception):
    def __init__(
        self,
        message: str,
        code: ErrorCodes | None = None,
        status_code: int = HTTP_422_UNPROCESSABLE_ENTITY,
    ):
        self.message = message
        self.code = code
        self.status_code = status_code


class FormFieldValidationError(ApplicationException):
    def __init__(
        self, error: str, attribute: str = "general", code: ErrorCodes | None = None
    ):
        self.error = error
        self.attribute = attribute
        self.code = code


class ValidationError(ApplicationException):
    def __init__(self, message: str, code: ErrorCodes | None = None):
        self.message = message
        self.code = code


class NotPermittedError(ValidationError):
    def __init__(
        self,
        message: str = "You do not have permissions to do this",
        code: ErrorCodes = ErrorCodes.NOT_ALLOWED,
    ):
        super().__init__(message, code)
        self.status_code = HTTP_403_FORBIDDEN
