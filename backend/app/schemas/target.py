from pydantic import BaseModel, ConfigDict


class TargetRequest(BaseModel):
    """目标请求模型"""
    name: str


class TargetResponse(BaseModel):
    """目标响应模型"""
    id: int
    name: str
    
    model_config = ConfigDict(
        from_attributes=True
    )
