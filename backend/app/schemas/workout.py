from typing import Optional, Set, TYPE_CHECKING
from datetime import datetime
from pydantic import BaseModel, Field
from app.schemas.gym import GymResponse
from app.schemas.target import TargetResponse

# 避免循环导入
if TYPE_CHECKING:
    from app.schemas.routine import RoutineSummaryResponse


class WorkoutRequest(BaseModel):
    """训练请求模型"""
    id: Optional[int] = None
    start_time: Optional[datetime] = Field(None, description="训练开始时间")
    end_time: Optional[datetime] = Field(None, description="训练结束时间")
    gym: int = Field(..., gt=0, description="健身房ID")
    routine: Optional[int] = Field(None, gt=0, description="训练计划ID")
    target: Set[int] = Field(..., min_items=1, description="目标ID集合")
    note: Optional[str] = Field(None, max_length=500, description="训练备注")


class WorkoutResponse(BaseModel):
    """训练响应模型"""
    id: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    gym: GymResponse
    routine: Optional['RoutineSummaryResponse'] = None
    target: Set[TargetResponse] = Field(default_factory=set)
    note: Optional[str] = None
    
    class Config:
        from_attributes = True


class WorkoutSummaryResponse(BaseModel):
    """训练摘要响应模型"""
    id: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    gym: GymResponse
    target: Set[TargetResponse] = Field(default_factory=set)
    note: Optional[str] = None
    
    class Config:
        from_attributes = True


# 解决循环导入问题
from app.schemas.routine import RoutineSummaryResponse
WorkoutResponse.model_rebuild()
