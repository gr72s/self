from typing import List
import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "Self API"
    DEBUG: bool = True
    
    # 数据库配置
    @property
    def DATABASE_URL(self) -> str:
        user_home = os.path.expanduser("~")
        db_dir = os.path.join(user_home, ".self")
        os.makedirs(db_dir, exist_ok=True)
        db_path = os.path.join(db_dir, "self.db")
        return f"sqlite:///{db_path}"
    
    # JWT配置
    SECRET_KEY: str = "7f3a9b2c8e1d4f6a5b9c8e7d1a3f4b6c8e9d2a5f7c1b3e8d4a6f9c2b5e8a1d4f7b"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    
    # CORS配置
    CORS_ORIGINS: List[str] = ["*"]
    
    # 微信配置
    @property
    def WECHAT_APPID(self) -> str:
        config = self._load_config()
        appid = config.get("WECHAT_APPID")
        
        if appid is None:
            import os
            appid = os.environ.get("WECHAT_APPID")
        
        if appid is None:
            from app.core.exceptions import NotFoundWeChatConfig
            raise NotFoundWeChatConfig("WECHAT_APPID not found")
        
        return appid
    
    @property
    def WECHAT_SECRET(self) -> str:
        config = self._load_config()
        secret = config.get("WECHAT_SECRET")
        
        if secret is None:
            import os
            secret = os.environ.get("WECHAT_SECRET")
        
        if secret is None:
            from app.core.exceptions import NotFoundWeChatConfig
            raise NotFoundWeChatConfig("WECHAT_SECRET not found")
        
        return secret
    
    def _load_config(self) -> dict:
        """从配置文件加载配置"""
        import json
        user_home = os.path.expanduser("~")
        config_dir = os.path.join(user_home, ".self")
        config_file = os.path.join(config_dir, "config.json")
        os.makedirs(config_dir, exist_ok=True)
        
        try:
            with open(config_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=True
    )


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
