from typing import Optional, List, Set
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.muscle import MuscleResponse


class ExerciseRequest(BaseModel):
    """练习请求模型"""
    id: Optional[int] = None
    name: str = Field(..., min_length=2, max_length=100, description="练习名称")
    description: Optional[str] = Field(None, max_length=500, description="练习描述")
    main_muscles: Set[int] = Field(..., min_items=1, description="主肌肉ID集合")
    support_muscles: Set[int] = Field(default_factory=set, description="辅助肌肉ID集合")
    cues: List[str] = Field(default_factory=list, description="练习提示列表")


class ExerciseResponse(BaseModel):
    """练习响应模型"""
    id: int
    name: str
    description: Optional[str] = None
    main_muscles: List[MuscleResponse] = Field(default_factory=list)
    support_muscles: List[MuscleResponse] = Field(default_factory=list)
    cues: List[str] = Field(default_factory=list)
    
    model_config = ConfigDict(
        from_attributes=True
    )
