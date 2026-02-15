from functools import lru_cache
from typing import List
import json
import os

from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Self API"
    DEBUG: bool = True
    BOOT_ENV: str = "development"

    SECRET_KEY: str = "7f3a9b2c8e1d4f6a5b9c8e7d1a3f4b6c8e9d2a5f7c1b3e8d4a6f9c2b5e8a1d4f7b"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    CORS_ORIGINS: List[str] = ["*"]

    @property
    def ENVIRONMENT(self) -> str:
        return self.BOOT_ENV

    @property
    def PROJECT_PATH(self) -> str:
        return os.path.expanduser(self._load_config()["PROJECT_PATH"])

    @property
    def CONFIG_DEBUG(self) -> bool:
        return self._load_config()["DEBUG"]

    @property
    def DATABASE_URL(self) -> str:
        config = self._load_config()
        db_path = os.path.expanduser(config["PROJECT_PATH"])
        db_name = config["DB_NAME"][self.ENVIRONMENT]
        os.makedirs(db_path, exist_ok=True)
        db_file_path = os.path.join(db_path, db_name)
        return f"sqlite:///{db_file_path}"

    def cleanup_development_db(self):
        """Clean up development database file."""
        if self.ENVIRONMENT != "development":
            return

        config = self._load_config()
        db_path = os.path.expanduser(config["PROJECT_PATH"])
        db_name = config["DB_NAME"]["development"]
        db_file_path = os.path.join(db_path, db_name)

        if os.path.exists(db_file_path):
            try:
                os.remove(db_file_path)
                print(f"Removed development database: {db_file_path}")
            except Exception as exc:
                print(f"Error removing development database: {exc}")

    @property
    def WECHAT_APPID(self) -> str:
        config = self._load_config()
        project_path = os.path.expanduser(config["PROJECT_PATH"])
        appid_file = os.path.join(project_path, "appid")

        if not os.path.exists(appid_file):
            from app.core.exceptions import NotFoundWeChatConfig
            raise NotFoundWeChatConfig(f"appid file not found at {appid_file}")

        try:
            with open(appid_file, "r", encoding="utf-8") as f:
                appid = f.read().strip()
        except Exception as exc:
            from app.core.exceptions import NotFoundWeChatConfig
            raise NotFoundWeChatConfig(f"Failed to read appid file: {exc}")

        if not appid:
            from app.core.exceptions import NotFoundWeChatConfig
            raise NotFoundWeChatConfig(f"appid file is empty at {appid_file}")

        return appid

    @property
    def WECHAT_APPSECRET(self) -> str:
        config = self._load_config()
        project_path = os.path.expanduser(config["PROJECT_PATH"])
        appsecret_file = os.path.join(project_path, "appsecret")

        if not os.path.exists(appsecret_file):
            from app.core.exceptions import NotFoundWeChatConfig
            raise NotFoundWeChatConfig(f"appsecret file not found at {appsecret_file}")

        try:
            with open(appsecret_file, "r", encoding="utf-8") as f:
                appsecret = f.read().strip()
        except Exception as exc:
            from app.core.exceptions import NotFoundWeChatConfig
            raise NotFoundWeChatConfig(f"Failed to read appsecret file: {exc}")

        if not appsecret:
            from app.core.exceptions import NotFoundWeChatConfig
            raise NotFoundWeChatConfig(f"appsecret file is empty at {appsecret_file}")

        return appsecret

    def _load_config(self) -> dict:
        """Load config from ~/.self/config.json."""
        config_file = os.path.join(os.path.expanduser("~"), ".self", "config.json")

        try:
            with open(config_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError as exc:
            raise RuntimeError(
                f"Config file not found: {config_file}. Run 'self init-project' and 'self check-project' first."
            ) from exc
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"Invalid JSON in config file: {config_file}") from exc

    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
