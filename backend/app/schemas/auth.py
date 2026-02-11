from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class UserResponse(BaseModel):
    """用户响应模型"""
    id: int
    username: str
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(
        from_attributes=True
    )


class LoginRequest(BaseModel):
    """登录请求模型"""
    username: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    """令牌响应模型"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
