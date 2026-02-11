from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.security import create_access_token
from app.core.config import settings
from app.services.auth import AuthService
from app.services.wechat import WeChatService
from app.schemas.auth import TokenResponse, UserResponse
from app.schemas.wechat import WeChatLoginRequest

router = APIRouter()


@router.post("/wechat", response_model=TokenResponse)
async def wechat_login(request: WeChatLoginRequest, db: Session = Depends(get_db)):
    """微信登录"""
    # 获取微信访问令牌
    token_response = await WeChatService.get_access_token(request.code)
    if not token_response:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to get WeChat access token",
        )
    
    # 获取微信用户信息
    user_info = await WeChatService.get_user_info(token_response.access_token, token_response.openid)
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to get WeChat user info",
        )
    
    # 创建或更新用户
    user = AuthService.create_or_update_wechat_user(
        db,
        openid=user_info.openid,
        wechat_unionid=user_info.unionid,
        nickname=user_info.nickname,
        avatar=user_info.headimgurl
    )
    
    # 生成访问令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )
