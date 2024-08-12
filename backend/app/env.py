from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENV: str = ""
    DOC_TITLE: str = "Incidental"

    DATABASE_HOST: str = ""
    DATABASE_NAME: str = ""
    DATABASE_PASSWORD: str = ""
    DATABASE_PORT: str = ""
    DATABASE_USER: str = ""

    FRONTEND_URL: str = ""

    # slack
    SLACK_APP_ID: str = ""
    SLACK_CLIENT_ID: str = ""
    SLACK_CLIENT_SECRET: str = ""
    SLACK_SIGNING_SECRET: str = ""
    SLACK_VERIFICATION_TOKEN: str = ""
    SLACK_OPENID_AUTHORIZE_URL: str = ""
    SLACK_OPENID_TOKEN_URL: str = ""
    SLACK_OAUTH_AUTHORIZE_URL: str = ""
    SLACK_OAUTH_TOKEN_URL: str = ""

    APP_SECRET: str = ""

    # celery
    CELERY_BROKER_URL: str = ""

    # redis
    REDIS_HOST: str = ""
    REDIS_PORT: int = 6379

    LOG_FORMAT: str = "console"  # console or json

    # sendgrid
    SENDGRID_API_KEY: str = ""
    SUPPORT_EMAIL: str = ""
    SUPPORT_EMAIL_NAME: str = ""


settings = Settings()
