from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.exceptions import ApplicationException, FormFieldValidationError
from app.routes import forms, health, incidents, severities, slack, timestamps, users, world

from .env import settings


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

    # exception handler for form field validation errors
    @app.exception_handler(FormFieldValidationError)
    async def application_formfield_validation_exception_handler(
        request: Request, err: FormFieldValidationError
    ) -> JSONResponse:
        """
        For our custom validation exception
        """
        return JSONResponse(
            status_code=422,
            content=jsonable_encoder(
                {
                    "errors": [{"loc": [err.attribute], "type": "general", "msg": err.detail}],
                    "detail": err.detail,
                    "code": err.code if err.code else "generic_error",
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
                    "code": err.code if err.code else "generic_error",
                }
            ),
        )

    return app


app = create_app()
