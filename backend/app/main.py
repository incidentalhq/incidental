import structlog
from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import NoResultFound

from app.exceptions import ApplicationException, ErrorCodes, FormFieldValidationError
from app.routes import forms, health, incidents, organisations, severities, slack, timestamps, users, world
from app.utils import setup_logger

from .env import settings

setup_logger()
logger = structlog.get_logger(logger_name=__name__)


def create_app() -> FastAPI:
    app = FastAPI(debug=settings.ENV == "development", title=settings.DOC_TITLE)

    app.add_middleware(
        CORSMiddleware,
        allow_origins="*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(users.router, prefix="/users")
    app.include_router(world.router, prefix="/world")
    app.include_router(health.router, prefix="/health")
    app.include_router(slack.router, prefix="/slack")
    app.include_router(incidents.router, prefix="/incidents")
    app.include_router(forms.router, prefix="/forms")
    app.include_router(severities.router, prefix="/severities")
    app.include_router(timestamps.router, prefix="/timestamps")
    app.include_router(organisations.router, prefix="/organisations")

    # exception handler for form field validation errors
    @app.exception_handler(FormFieldValidationError)
    async def form_field_validation_exception_handler(request: Request, err: FormFieldValidationError) -> JSONResponse:
        """
        For our custom validation exception
        """
        return JSONResponse(
            status_code=422,
            content=jsonable_encoder(
                {
                    "errors": [{"loc": [err.attribute], "type": "general", "msg": err.detail}],
                    "detail": err.detail,
                    "code": err.code if err.code else ErrorCodes.UNKNOWN,
                }
            ),
        )

    # exception handler for generic application exceptions
    @app.exception_handler(ApplicationException)
    async def application_exception_handler(request: Request, err: ApplicationException) -> JSONResponse:
        return JSONResponse(
            status_code=err.status_code,
            content=jsonable_encoder(
                {
                    "detail": err.detail,
                    "code": err.code if err.code else ErrorCodes.UNKNOWN,
                }
            ),
        )

    # exception handler for when a model cannot be found in the db
    @app.exception_handler(NoResultFound)
    async def no_result_found_exception_handler(request: Request, err: NoResultFound) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=jsonable_encoder(
                {
                    "detail": "Could not find resource",
                    "code": ErrorCodes.MODEL_NOT_FOUND,
                }
            ),
        )

    # exception handler when pydantic validation fails
    @app.exception_handler(RequestValidationError)
    async def request_validation_exception_handler(request: Request, err: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=jsonable_encoder(
                {
                    "detail": "There was an error validating the request",
                    "errors": [
                        {
                            "loc": item["loc"],
                            "msg": item["msg"],
                        }
                        for item in err.errors()
                    ],
                    "code": ErrorCodes.VALIDATION,
                }
            ),
        )

    return app


app = create_app()
