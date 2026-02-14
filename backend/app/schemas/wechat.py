from pydantic import BaseModel


class WeChatLoginRequest(BaseModel):
    """微信登录请求模型"""
    code: str
    nickname: str = None
    avatar: str = None


class WeChatTokenResponse(BaseModel):
    """微信令牌响应模型"""
    session_key: str
    openid: str
    unionid: str = None


class WeChatUserInfoResponse(BaseModel):
    """微信用户信息响应模型"""
    openid: str
    nickname: str
    sex: int
    province: str
    city: str
    country: str
    headimgurl: str
    privilege: list
    unionid: str = None
