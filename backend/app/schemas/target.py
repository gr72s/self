from pydantic import BaseModel


class TargetRequest(BaseModel):
    """目标请求模型"""
    name: str


class TargetResponse(BaseModel):
    """目标响应模型"""
    id: int
    name: str
    
    class Config:
        from_attributes = True
