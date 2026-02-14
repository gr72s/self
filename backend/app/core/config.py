from typing import List
import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "Self API"
    DEBUG: bool = True
    
    # 环境配置
    SELF_ENV: str = "development"
    
    @property
    def ENVIRONMENT(self) -> str:
        return self.SELF_ENV
    
    # 数据库配置
    @property
    def DATABASE_URL(self) -> str:
        # 根据环境选择数据库文件位置
        if self.ENVIRONMENT == "production":
            # Production环境：使用~/.self目录
            user_home = os.path.expanduser("~")
            self_dir = os.path.join(user_home, ".self")
            os.makedirs(self_dir, exist_ok=True)
            db_name = "self.db"
            db_path = os.path.join(self_dir, db_name)
        else:
            # 其他环境：使用项目目录
            project_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            if self.ENVIRONMENT == "testing":
                db_name = "self.test.db"
            else:  # development
                db_name = "self.dev.db"
            db_path = os.path.join(project_dir, db_name)
        
        return f"sqlite:///{db_path}"
    
    def cleanup_development_db(self):
        """清理开发环境数据库文件"""
        if self.ENVIRONMENT == "development":
            user_home = os.path.expanduser("~")
            self_dir = os.path.join(user_home, ".self")
            db_path = os.path.join(self_dir, "self.dev.db")
            if os.path.exists(db_path):
                try:
                    os.remove(db_path)
                    print(f"Removed development database: {db_path}")
                except Exception as e:
                    print(f"Error removing development database: {e}")
    
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
        secret = config.get("WECHAT_APPSECRET")
        
        if secret is None:
            import os
            secret = os.environ.get("WECHAT_APPSECRET")
        
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
        case_sensitive=True,
        extra='ignore'
    )


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
