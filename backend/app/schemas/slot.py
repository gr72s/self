from typing import Optional, TYPE_CHECKING
from pydantic import BaseModel, Field
from app.schemas.exercise import ExerciseResponse
from app.models.slot import Category

# 避免循环导入
if TYPE_CHECKING:
    from app.schemas.routine import RoutineSummaryResponse


class SlotRequest(BaseModel):
    """训练槽请求模型"""
    id: Optional[int] = None
    routine_id: int = Field(..., description="训练计划ID")
    exercise_id: int = Field(..., description="练习ID")
    stars: int = Field(..., ge=0, le=5, description="训练槽评分")
    category: Category = Field(default=Category.WorkingSets, description="训练槽类别")
    set_number: Optional[int] = Field(None, ge=1, description="组数")
    weight: Optional[float] = Field(None, ge=0, description="重量")
    reps: Optional[int] = Field(None, ge=1, description="次数")
    duration: Optional[int] = Field(0, ge=0, description="持续时间")
    sequence: int = Field(..., ge=0, description="训练槽顺序")


class SlotResponse(BaseModel):
    """训练槽响应模型"""
    id: int
    routine: 'RoutineSummaryResponse'
    exercise: ExerciseResponse
    stars: int
    category: Category
    set_number: Optional[int] = None
    weight: Optional[float] = None
    reps: Optional[int] = None
    duration: Optional[int] = None
    sequence: int
    
    class Config:
        from_attributes = True


class SlotSummaryResponse(BaseModel):
    """训练槽摘要响应模型"""
    id: int
    exercise: ExerciseResponse
    stars: int
    category: Category
    set_number: Optional[int] = None
    weight: Optional[float] = None
    reps: Optional[int] = None
    duration: Optional[int] = None
    sequence: int
    
    class Config:
        from_attributes = True


# 解决循环导入问题
from app.schemas.routine import RoutineSummaryResponse
SlotResponse.model_rebuild()
