
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./controle_financeiro.db"
    cors_origins: str = "http://localhost:5173"
    dev_user_email: str = "dev@local.test"
    dev_user_password: str = ""
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
