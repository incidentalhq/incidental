from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENV: str = ""

    DATABASE_HOST: str = ""
    DATABASE_NAME: str = ""
    DATABASE_PASSWORD: str = ""
    DATABASE_PORT: str = ""
    DATABASE_USER: str = ""

    AWS_REGION: str = ""
    AWS_KEY_ID: str = ""
    AWS_SECRET: str = ""

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


settings = Settings()
