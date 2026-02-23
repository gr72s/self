from typing import List, Optional, Set

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.muscle import MuscleResponse


class ExerciseRequest(BaseModel):
    id: Optional[int] = None
    name: str = Field(..., min_length=2, max_length=100, description="练习名称")
    description: Optional[str] = Field(None, max_length=500, description="练习描述")
    keypoint: Optional[str] = Field(None, description="练习要点")
    origin_name: Optional[str] = Field(None, description="练习原名")
    main_muscles: Set[int] = Field(..., min_length=1, description="主肌肉ID集合")
    support_muscles: Set[int] = Field(default_factory=set, description="辅助肌肉ID集合")
    cues: List[str] = Field(default_factory=list, description="练习提示列表")


class ExerciseResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    keypoint: Optional[str] = None
    origin_name: Optional[str] = None
    main_muscles: List[MuscleResponse] = Field(default_factory=list)
    support_muscles: List[MuscleResponse] = Field(default_factory=list)
    cues: List[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
