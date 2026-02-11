from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # 应用配置
    APP_NAME: str = "Self API"
    DEBUG: bool = True
    
    # 数据库配置
    DATABASE_URL: str = "sqlite:///./self.db"
    
    # JWT配置
    SECRET_KEY: str = "7f3a9b2c8e1d4f6a5b9c8e7d1a3f4b6c8e9d2a5f7c1b3e8d4a6f9c2b5e8a1d4f7b"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    
    # CORS配置
    CORS_ORIGINS: List[str] = ["*"]
    
    # 微信配置
    WECHAT_APPID: str = "wxtest1234567890abc"
    WECHAT_SECRET: str = "test-secret-for-development-only"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
