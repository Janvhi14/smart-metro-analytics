from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_key: str = ""
    secret_key: str = "changeme"

    class Config:
        env_file = ".env"

settings = Settings()
