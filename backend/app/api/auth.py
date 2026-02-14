from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.security import create_access_token
from app.core.config import settings
from app.services.auth import AuthService
from app.services.wechat import WeChatService
from app.schemas.auth import UserResponse, TokenResponse
from app.schemas.wechat import WeChatLoginRequest

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """获取当前用户"""
    from app.core.security import verify_token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = AuthService.get_user_by_id(db, int(user_id))
    return user


@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """用户登录"""
    user = AuthService.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
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


@router.get("/current", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """获取当前用户信息"""
    return UserResponse.model_validate(current_user)


@router.post("/wechat", response_model=TokenResponse)
async def wechat_login(request: WeChatLoginRequest, db: Session = Depends(get_db)):
    """微信登录"""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"微信登录请求开始，code: {request.code[:10]}...")  # 只记录code的前10位，避免安全问题
        
        # 获取微信访问令牌
        logger.info("调用WeChatService.get_access_token")
        token_response = await WeChatService.get_access_token(request.code)
        
        if not token_response:
            logger.error("获取微信访问令牌失败")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to get WeChat access token",
            )
        
        logger.info(f"获取微信访问令牌成功，openid: {token_response.openid[:10]}...")
        
        # 创建或更新用户
        logger.info("创建或更新微信用户")
        user = AuthService.create_or_update_wechat_user(
            db,
            openid=token_response.openid,
            wechat_unionid=token_response.unionid,
            nickname=request.nickname or "微信用户",  # 使用前端提供的昵称，或默认昵称
            avatar=request.avatar or ""  # 使用前端提供的头像，或默认头像
        )
        
        logger.info(f"用户创建/更新成功，user_id: {user.id}")
        
        # 生成访问令牌
        logger.info("生成访问令牌")
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=access_token_expires
        )
        
        logger.info("访问令牌生成成功")
        
        response = TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
        
        logger.info("微信登录请求完成")
        return response
    except Exception as e:
        logger.error(f"微信登录失败: {str(e)}", exc_info=True)
        raise
