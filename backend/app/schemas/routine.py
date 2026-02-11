from typing import Optional, List, Set, TYPE_CHECKING
from pydantic import BaseModel, Field
from app.schemas.target import TargetResponse

# 避免循环导入
if TYPE_CHECKING:
    from app.schemas.slot import SlotResponse
    from app.schemas.workout import WorkoutResponse


class ChecklistItem(BaseModel):
    """检查项模型"""
    name: str
    is_optional: bool = False


class RoutineRequest(BaseModel):
    """训练计划请求模型"""
    id: Optional[int] = None
    name: str = Field(..., min_length=2, max_length=100, description="训练计划名称")
    description: Optional[str] = Field(None, max_length=500, description="训练计划描述")
    workout_id: Optional[int] = None
    target_ids: Set[int] = Field(default_factory=set, description="目标ID集合")
    checklist: List[ChecklistItem] = Field(default_factory=list, description="检查项列表")
    note: Optional[str] = Field(None, max_length=500, description="训练计划备注")


class RoutineResponse(BaseModel):
    """训练计划响应模型"""
    id: int
    name: str
    description: Optional[str] = None
    workout: Optional['WorkoutResponse'] = None
    targets: List[TargetResponse] = Field(default_factory=list)
    slots: List['SlotResponse'] = Field(default_factory=list)
    checklist: List[ChecklistItem] = Field(default_factory=list)
    note: Optional[str] = None
    
    class Config:
        from_attributes = True


class RoutineSummaryResponse(BaseModel):
    """训练计划摘要响应模型"""
    id: int
    name: str
    description: Optional[str] = None
    targets: List[TargetResponse] = Field(default_factory=list)
    
    class Config:
        from_attributes = True


# 解决循环导入问题
from app.schemas.slot import SlotResponse
from app.schemas.workout import WorkoutResponse
RoutineResponse.model_rebuild()
