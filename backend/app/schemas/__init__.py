from app.schemas.response import Response, PageResponse
from app.schemas.auth import UserResponse, LoginRequest, TokenResponse
from app.schemas.wechat import WeChatLoginRequest, WeChatTokenResponse, WeChatUserInfoResponse
from app.schemas.muscle import MuscleRequest, MuscleResponse
from app.schemas.target import TargetResponse
from app.schemas.gym import GymRequest, GymResponse
from app.schemas.exercise import ExerciseRequest, ExerciseResponse
from app.schemas.routine import RoutineRequest, RoutineResponse, RoutineSummaryResponse, ChecklistItem
from app.schemas.slot import SlotRequest, SlotResponse, SlotSummaryResponse
from app.schemas.workout import WorkoutRequest, WorkoutResponse, WorkoutSummaryResponse

__all__ = [
    "Response",
    "PageResponse",
    "UserResponse",
    "LoginRequest",
    "TokenResponse",
    "WeChatLoginRequest",
    "WeChatTokenResponse",
    "WeChatUserInfoResponse",
    "MuscleRequest",
    "MuscleResponse",
    "TargetResponse",
    "GymRequest",
    "GymResponse",
    "ExerciseRequest",
    "ExerciseResponse",
    "RoutineRequest",
    "RoutineResponse",
    "RoutineSummaryResponse",
    "ChecklistItem",
    "SlotRequest",
    "SlotResponse",
    "SlotSummaryResponse",
    "WorkoutRequest",
    "WorkoutResponse",
    "WorkoutSummaryResponse"
]
