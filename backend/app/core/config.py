from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # SQLITE Config
    DATABASE_URL: str = "sqlite:///./test.db"

    class Config:
        # Si on utilisait un fichier .env, il faudrait spécifier son chemin ici
        # env_file = ".env"
        # env_file_encoding = 'utf-8'
        pass


settings = Settings()
