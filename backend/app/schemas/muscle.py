from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class MuscleRequest(BaseModel):
    """肌肉请求模型"""
    name: str = Field(..., min_length=2, max_length=100, description="肌肉名称")
    description: Optional[str] = Field(None, max_length=500, description="肌肉描述")
    function: Optional[str] = Field(None, max_length=200, description="肌肉功能")
    origin_name: Optional[str] = Field(None, max_length=100, description="肌肉起点名称")


class MuscleResponse(BaseModel):
    """肌肉响应模型"""
    id: int
    name: str
    description: Optional[str] = None
    function: Optional[str] = None
    origin_name: Optional[str] = None
    
    model_config = ConfigDict(
        from_attributes=True
    )
