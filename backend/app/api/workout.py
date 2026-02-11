from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.workout import WorkoutService
from app.schemas.workout import WorkoutRequest, WorkoutResponse, WorkoutSummaryResponse
from app.schemas.gym import GymResponse
from app.schemas.routine import RoutineSummaryResponse
from app.schemas.target import TargetResponse
from app.schemas.response import Response, PageResponse

router = APIRouter()


@router.post("", response_model=Response)
async def create_workout(request: WorkoutRequest, db: Session = Depends(get_db)):
    """创建训练"""
    workout = WorkoutService.create(
        db,
        start_time=request.start_time,
        gym_id=request.gym,
        routine_id=request.routine,
        target_ids=request.target,
        note=request.note
    )
    
    # 构建响应
    gym_response = GymResponse(
        id=workout.gym.id,
        name=workout.gym.name,
        location=workout.gym.location
    )
    
    targets = [TargetResponse.model_validate(target) for target in workout.targets]
    
    response_data = WorkoutResponse(
        id=workout.id,
        start_time=workout.start_time,
        end_time=workout.end_time,
        gym=gym_response,
        routine=None,
        target=set(targets),
        note=workout.note
    )
    
    return Response(data=response_data)


@router.put("/{workout_id}", response_model=Response)
async def update_workout(workout_id: int, request: WorkoutRequest, db: Session = Depends(get_db)):
    """更新训练"""
    workout = WorkoutService.update(
        db,
        workout_id=workout_id,
        start_time=request.start_time,
        end_time=request.end_time,
        gym_id=request.gym,
        routine_id=request.routine,
        target_ids=request.target,
        note=request.note
    )
    
    # 构建响应
    gym_response = GymResponse(
        id=workout.gym.id,
        name=workout.gym.name,
        location=workout.gym.location
    )
    
    # 处理训练计划关联
    routine_response = None
    if workout.routine:
        routine_response = RoutineSummaryResponse(
            id=workout.routine.id,
            name=workout.routine.name,
            description=workout.routine.description,
            targets=set()
        )
    
    targets = [TargetResponse.model_validate(target) for target in workout.targets]
    
    response_data = WorkoutResponse(
        id=workout.id,
        start_time=workout.start_time,
        end_time=workout.end_time,
        gym=gym_response,
        routine=routine_response,
        target=set(targets),
        note=workout.note
    )
    
    return Response(data=response_data)


@router.post("/stop", response_model=Response)
async def stop_workout(request: WorkoutRequest, db: Session = Depends(get_db)):
    """停止训练"""
    workout = WorkoutService.update(
        db,
        workout_id=request.id,
        start_time=request.start_time,
        end_time=request.end_time,
        gym_id=request.gym,
        routine_id=request.routine,
        target_ids=request.target,
        note=request.note
    )
    
    # 构建响应
    gym_response = GymResponse(
        id=workout.gym.id,
        name=workout.gym.name,
        location=workout.gym.location
    )
    
    # 处理训练计划关联
    routine_response = None
    if workout.routine:
        routine_response = RoutineSummaryResponse(
            id=workout.routine.id,
            name=workout.routine.name,
            description=workout.routine.description,
            targets=set()
        )
    
    targets = [TargetResponse.model_validate(target) for target in workout.targets]
    
    response_data = WorkoutResponse(
        id=workout.id,
        start_time=workout.start_time,
        end_time=workout.end_time,
        gym=gym_response,
        routine=routine_response,
        target=set(targets),
        note=workout.note
    )
    
    return Response(data=response_data)


@router.get("", response_model=Response)
async def get_all_workouts(
    page: int = Query(0, ge=0, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页大小"),
    start_date: Optional[datetime] = Query(None, description="开始日期"),
    end_date: Optional[datetime] = Query(None, description="结束日期"),
    db: Session = Depends(get_db)
):
    """获取所有训练"""
    skip = page * size
    workouts = WorkoutService.get_all(db, start_date=start_date, end_date=end_date, skip=skip, limit=size)
    total = WorkoutService.get_total_count(db, start_date=start_date, end_date=end_date)
    
    items = []
    for workout in workouts:
        gym_response = GymResponse(
            id=workout.gym.id,
            name=workout.gym.name,
            location=workout.gym.location
        )
        
        targets = [TargetResponse.model_validate(target) for target in workout.targets]
        
        item = WorkoutResponse(
            id=workout.id,
            start_time=workout.start_time,
            end_time=workout.end_time,
            gym=gym_response,
            routine=None,
            target=set(targets),
            note=workout.note
        )
        items.append(item)
    
    page_response = PageResponse(
        total=total,
        page=page,
        size=size,
        items=items
    )
    
    return Response(data=page_response)


@router.get("/in-process", response_model=Response)
async def find_in_process_workout(db: Session = Depends(get_db)):
    """查找进行中的训练"""
    workout = WorkoutService.find_in_process_workout(db)
    
    if not workout:
        return Response(data=None)
    
    # 构建响应
    gym_response = GymResponse(
        id=workout.gym.id,
        name=workout.gym.name,
        location=workout.gym.location
    )
    
    # 处理训练计划关联
    routine_response = None
    if workout.routine:
        routine_response = RoutineSummaryResponse(
            id=workout.routine.id,
            name=workout.routine.name,
            description=workout.routine.description,
            targets=set()
        )
    
    targets = [TargetResponse.model_validate(target) for target in workout.targets]
    
    response_data = WorkoutResponse(
        id=workout.id,
        start_time=workout.start_time,
        end_time=workout.end_time,
        gym=gym_response,
        routine=routine_response,
        target=set(targets),
        note=workout.note
    )
    
    return Response(data=response_data)
