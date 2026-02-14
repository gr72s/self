from typing import List
import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "Self API"
    DEBUG: bool = True
    
    # 环境配置
    BOOT_ENV: str = "development"
    
    @property
    def ENVIRONMENT(self) -> str:
        return self.BOOT_ENV
    
    # 数据库配置
    @property
    def DATABASE_URL(self) -> str:
        # 从配置文件中获取数据库路径和名称
        config = self._load_config()
        
        # 获取PROJECT_PATH，如果不存在则使用默认值
        db_path_template = config.get("PROJECT_PATH", "~/.self/")
        # 扩展~为用户主目录
        db_path = os.path.expanduser(db_path_template)
        
        # 获取DB_NAME，如果不存在则使用默认值
        db_name_config = config.get("DB_NAME", {})
        # 根据环境获取数据库名称
        db_name = db_name_config.get(self.ENVIRONMENT, db_name_config.get("default", "self.db"))
        
        # 确保目录存在
        os.makedirs(db_path, exist_ok=True)
        
        # 构建数据库文件路径
        db_file_path = os.path.join(db_path, db_name)
        
        return f"sqlite:///{db_file_path}"
    
    def cleanup_development_db(self):
        """清理开发环境数据库文件"""
        if self.ENVIRONMENT == "development":
            # 从配置文件中获取数据库路径和名称
            config = self._load_config()
            
            # 获取PROJECT_PATH，如果不存在则使用默认值
            db_path_template = config.get("PROJECT_PATH", "~/.self/")
            # 扩展~为用户主目录
            db_path = os.path.expanduser(db_path_template)
            
            # 获取DB_NAME，如果不存在则使用默认值
            db_name_config = config.get("DB_NAME", {})
            # 获取开发环境的数据库名称
            db_name = db_name_config.get("development", db_name_config.get("default", "self.db"))
            
            # 构建数据库文件路径
            db_file_path = os.path.join(db_path, db_name)
            
            if os.path.exists(db_file_path):
                try:
                    os.remove(db_file_path)
                    print(f"Removed development database: {db_file_path}")
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
        # 从配置文件中获取PROJECT_PATH
        config = self._load_config()
        project_path_template = config.get("PROJECT_PATH", "~/.self/")
        project_path = os.path.expanduser(project_path_template)
        
        # 构建appid文件路径
        appid_file = os.path.join(project_path, "appid")
        
        # 检查文件是否存在
        if not os.path.exists(appid_file):
            from app.core.exceptions import NotFoundWeChatConfig
            raise NotFoundWeChatConfig(f"appid file not found at {appid_file}")
        
        # 读取文件内容
        try:
            with open(appid_file, "r", encoding="utf-8") as f:
                appid = f.read().strip()
        except Exception as e:
            from app.core.exceptions import NotFoundWeChatConfig
            raise NotFoundWeChatConfig(f"Failed to read appid file: {e}")
        
        # 检查文件是否为空
        if not appid:
            from app.core.exceptions import NotFoundWeChatConfig
            raise NotFoundWeChatConfig(f"appid file is empty at {appid_file}")
        
        return appid
    
    @property
    def WECHAT_APPSECRET(self) -> str:
        # 从配置文件中获取PROJECT_PATH
        config = self._load_config()
        project_path_template = config.get("PROJECT_PATH", "~/.self/")
        project_path = os.path.expanduser(project_path_template)
        
        # 构建appsecret文件路径
        appsecret_file = os.path.join(project_path, "appsecret")
        
        # 检查文件是否存在
        if not os.path.exists(appsecret_file):
            from app.core.exceptions import NotFoundWeChatConfig
            raise NotFoundWeChatConfig(f"appsecret file not found at {appsecret_file}")
        
        # 读取文件内容
        try:
            with open(appsecret_file, "r", encoding="utf-8") as f:
                appsecret = f.read().strip()
        except Exception as e:
            from app.core.exceptions import NotFoundWeChatConfig
            raise NotFoundWeChatConfig(f"Failed to read appsecret file: {e}")
        
        # 检查文件是否为空
        if not appsecret:
            from app.core.exceptions import NotFoundWeChatConfig
            raise NotFoundWeChatConfig(f"appsecret file is empty at {appsecret_file}")
        
        return appsecret
    
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
