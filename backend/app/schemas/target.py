from pydantic import BaseModel


class TargetResponse(BaseModel):
    """目标响应模型"""
    id: int
    name: str
    
    class Config:
        from_attributes = True
