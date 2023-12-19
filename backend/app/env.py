from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENV: str

    DATABASE_HOST: str
    DATABASE_NAME: str
    DATABASE_PASSWORD: str
    DATABASE_PORT: str
    DATABASE_USER: str

    AWS_REGION: str
    AWS_KEY_ID: str
    AWS_SECRET: str


settings = Settings()
