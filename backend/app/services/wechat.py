import httpx
from typing import Optional
from app.core.config import settings
from app.schemas.wechat import WeChatTokenResponse, WeChatUserInfoResponse


class WeChatService:
    """微信服务"""
    
    WECHAT_TOKEN_URL = "https://api.weixin.qq.com/sns/oauth2/access_token"
    WECHAT_USER_INFO_URL = "https://api.weixin.qq.com/sns/userinfo"
    
    @staticmethod
    async def get_access_token(code: str) -> Optional[WeChatTokenResponse]:
        """获取微信访问令牌"""
        params = {
            "appid": settings.WECHAT_APPID,
            "secret": settings.WECHAT_SECRET,
            "code": code,
            "grant_type": "authorization_code"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(WeChatService.WECHAT_TOKEN_URL, params=params)
            data = response.json()
            
            # 检查是否有错误
            if "errcode" in data:
                return None
            
            return WeChatTokenResponse(**data)
    
    @staticmethod
    async def get_user_info(access_token: str, openid: str) -> Optional[WeChatUserInfoResponse]:
        """获取微信用户信息"""
        params = {
            "access_token": access_token,
            "openid": openid,
            "lang": "zh_CN"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(WeChatService.WECHAT_USER_INFO_URL, params=params)
            data = response.json()
            
            # 检查是否有错误
            if "errcode" in data:
                return None
            
            return WeChatUserInfoResponse(**data)
