from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.exercise import ExerciseService
from app.schemas.exercise import ExerciseRequest, ExerciseResponse
from app.schemas.muscle import MuscleResponse
from app.schemas.response import Response, PageResponse

router = APIRouter()


@router.post("", response_model=Response)
async def create_exercise(request: ExerciseRequest, db: Session = Depends(get_db)):
    """创建练习"""
    exercise = ExerciseService.create(
        db,
        name=request.name,
        description=request.description,
        main_muscle_ids=request.main_muscles,
        support_muscle_ids=request.support_muscles,
        cues=request.cues
    )
    
    # 构建响应
    main_muscles = [MuscleResponse.model_validate(muscle) for muscle in exercise.main_muscles]
    support_muscles = [MuscleResponse.model_validate(muscle) for muscle in exercise.support_muscles]
    cues = ExerciseService.get_cues_list(exercise)
    
    response_data = ExerciseResponse(
        id=exercise.id,
        name=exercise.name,
        description=exercise.description,
        main_muscles=main_muscles,
        support_muscles=support_muscles,
        cues=cues
    )
    
    return Response(data=response_data)


@router.put("/{exercise_id}", response_model=Response)
async def update_exercise(exercise_id: int, request: ExerciseRequest, db: Session = Depends(get_db)):
    """更新练习"""
    exercise = ExerciseService.update(
        db,
        exercise_id=exercise_id,
        name=request.name,
        description=request.description,
        main_muscle_ids=request.main_muscles,
        support_muscle_ids=request.support_muscles,
        cues=request.cues
    )
    
    # 构建响应
    main_muscles = [MuscleResponse.model_validate(muscle) for muscle in exercise.main_muscles]
    support_muscles = [MuscleResponse.model_validate(muscle) for muscle in exercise.support_muscles]
    cues = ExerciseService.get_cues_list(exercise)
    
    response_data = ExerciseResponse(
        id=exercise.id,
        name=exercise.name,
        description=exercise.description,
        main_muscles=main_muscles,
        support_muscles=support_muscles,
        cues=cues
    )
    
    return Response(data=response_data)


@router.get("", response_model=Response)
async def get_all_exercises(
    page: int = Query(0, ge=0, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页大小"),
    name: Optional[str] = Query(None, description="练习名称"),
    db: Session = Depends(get_db)
):
    """获取所有练习"""
    skip = page * size
    exercises = ExerciseService.get_all(db, name=name, skip=skip, limit=size)
    total = ExerciseService.get_total_count(db, name=name)
    
    items = []
    for exercise in exercises:
        main_muscles = [MuscleResponse.model_validate(muscle) for muscle in exercise.main_muscles]
        support_muscles = [MuscleResponse.model_validate(muscle) for muscle in exercise.support_muscles]
        cues = ExerciseService.get_cues_list(exercise)
        
        item = ExerciseResponse(
            id=exercise.id,
            name=exercise.name,
            description=exercise.description,
            main_muscles=main_muscles,
            support_muscles=support_muscles,
            cues=cues
        )
        items.append(item)
    
    page_response = PageResponse(
        total=total,
        page=page,
        size=size,
        items=items
    )
    
    return Response(data=page_response)


@router.get("/{exercise_id}", response_model=Response)
async def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    """根据ID获取练习"""
    exercise = ExerciseService.get_by_id(db, exercise_id)
    
    # 构建响应
    main_muscles = [MuscleResponse.model_validate(muscle) for muscle in exercise.main_muscles]
    support_muscles = [MuscleResponse.model_validate(muscle) for muscle in exercise.support_muscles]
    cues = ExerciseService.get_cues_list(exercise)
    
    response_data = ExerciseResponse(
        id=exercise.id,
        name=exercise.name,
        description=exercise.description,
        main_muscles=main_muscles,
        support_muscles=support_muscles,
        cues=cues
    )
    
    return Response(data=response_data)
