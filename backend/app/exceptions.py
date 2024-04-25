from enum import Enum

from starlette import status


class ErrorCodes(Enum):
    OVER_QUOTA = "OVER_QUOTA"
    MODEL_NOT_FOUND = "MODEL_NOT_FOUND"
    NOT_ALLOWED = "NOT_ALLOWED"
    EXCEEDED_MAX_LOGIN_ATTEMPTS = "EXCEEDED_MAX_LOGIN_ATTEMPTS"
    USER_NOT_VERIFIED = "USER_NOT_VERIFIED"
    INCORRECT_CODE = "INCORRECT_CODE"
    SLACK_API_ERROR = "SLACK_API_ERROR"


class ApplicationException(Exception):
    def __init__(
        self,
        message: str,
        code: ErrorCodes | None = None,
        status_code: int = status.HTTP_400_BAD_REQUEST,
    ):
        self.message = message
        self.code = code
        self.status_code = status_code


class FormFieldValidationError(ApplicationException):
    def __init__(self, error: str, attribute: str = "general", code: ErrorCodes | None = None):
        self.error = error
        self.attribute = attribute
        self.code = code


class ValidationError(ApplicationException):
    def __init__(self, message: str, code: ErrorCodes | None = None):
        super().__init__(message, code)
        self.status_code = status.HTTP_422_UNPROCESSABLE_ENTITY


class NotPermittedError(ApplicationException):
    def __init__(
        self,
        message: str = "You do not have permissions to do this",
        code: ErrorCodes = ErrorCodes.NOT_ALLOWED,
    ):
        super().__init__(message, code)
        self.status_code = status.HTTP_403_FORBIDDEN


class ExternalApiError(ApplicationException):
    def __init__(self, message: str, code: ErrorCodes):
        super().__init__(message=message, code=code)
