import httpx
from typing import Optional
from app.core.config import settings
from app.schemas.wechat import WeChatTokenResponse, WeChatUserInfoResponse


class WeChatService:
    """微信服务"""
    
    WECHAT_TOKEN_URL = "https://api.weixin.qq.com/sns/jscode2session"
    WECHAT_USER_INFO_URL = "https://api.weixin.qq.com/sns/userinfo"
    
    @staticmethod
    async def get_access_token(code: str) -> Optional[WeChatTokenResponse]:
        """获取微信访问令牌"""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            logger.info(f"获取微信访问令牌开始，code: {code[:10]}...")
            
            params = {
                "appid": settings.WECHAT_APPID,
                "secret": settings.WECHAT_SECRET,
                "js_code": code,
                "grant_type": "authorization_code"
            }
            
            logger.info(f"调用微信接口: {WeChatService.WECHAT_TOKEN_URL}")
            logger.info(f"请求参数: appid={settings.WECHAT_APPID}, js_code={code[:10]}..., grant_type=authorization_code")
            
            async with httpx.AsyncClient() as client:
                response = await client.get(WeChatService.WECHAT_TOKEN_URL, params=params)
                logger.info(f"微信接口响应状态码: {response.status_code}")
                
                data = response.json()
                logger.info(f"微信接口响应数据: {data}")
                
                # 检查是否有错误
                if "errcode" in data:
                    logger.error(f"微信接口返回错误: errcode={data['errcode']}, errmsg={data.get('errmsg')}")
                    return None
                
                logger.info("获取微信访问令牌成功")
                return WeChatTokenResponse(**data)
        except Exception as e:
            logger.error(f"获取微信访问令牌失败: {str(e)}", exc_info=True)
            return None
    
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
