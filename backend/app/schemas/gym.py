from pydantic import BaseModel, Field


class GymRequest(BaseModel):
    """健身房请求模型"""
    name: str = Field(..., min_length=2, max_length=100, description="健身房名称")
    location: str = Field(..., min_length=2, max_length=200, description="健身房位置")


class GymResponse(BaseModel):
    """健身房响应模型"""
    id: int
    name: str
    location: str
    
    class Config:
        from_attributes = True
