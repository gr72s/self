from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.routine import RoutineService
from app.services.slot import SlotService
from app.schemas.routine import RoutineRequest, RoutineResponse, RoutineSummaryResponse, ChecklistItem
from app.schemas.slot import SlotRequest, SlotResponse, SlotSummaryResponse
from app.schemas.target import TargetResponse
from app.schemas.exercise import ExerciseResponse
from app.schemas.workout import WorkoutSummaryResponse
from app.schemas.gym import GymResponse
from app.schemas.response import Response, PageResponse

router = APIRouter()


@router.post("", response_model=Response)
async def create_routine(request: RoutineRequest, db: Session = Depends(get_db)):
    """创建训练计划"""
    # 转换checklist为字典列表
    checklist_data = [item.model_dump() for item in request.checklist]
    
    routine = RoutineService.create(
        db,
        name=request.name,
        description=request.description,
        workout_id=request.workout_id,
        target_ids=request.target_ids,
        checklist=checklist_data,
        note=request.note
    )
    
    # 构建响应
    targets = [TargetResponse.model_validate(target) for target in routine.targets]
    checklist = [ChecklistItem(**item) for item in RoutineService.get_checklist(routine)]
    
    response_data = RoutineResponse(
        id=routine.id,
        name=routine.name,
        description=routine.description,
        workout=None,
        targets=set(targets),
        slots=set(),
        checklist=checklist,
        note=routine.note
    )
    
    return Response(data=response_data)


@router.post("/template", response_model=Response)
async def create_routine_template(request: RoutineRequest, db: Session = Depends(get_db)):
    """创建训练计划模板"""
    # 转换checklist为字典列表
    checklist_data = [item.model_dump() for item in request.checklist]
    
    routine = RoutineService.create(
        db,
        name=request.name,
        description=request.description,
        workout_id=None,  # 模板没有关联的训练
        target_ids=request.target_ids,
        checklist=checklist_data,
        note=request.note
    )
    
    # 构建响应
    targets = [TargetResponse.model_validate(target) for target in routine.targets]
    checklist = [ChecklistItem(**item) for item in RoutineService.get_checklist(routine)]
    
    response_data = RoutineResponse(
        id=routine.id,
        name=routine.name,
        description=routine.description,
        workout=None,
        targets=set(targets),
        slots=set(),
        checklist=checklist,
        note=routine.note
    )
    
    return Response(data=response_data)


@router.put("/{routine_id}", response_model=Response)
async def update_routine(routine_id: int, request: RoutineRequest, db: Session = Depends(get_db)):
    """更新训练计划"""
    # 转换checklist为字典列表
    checklist_data = [item.model_dump() for item in request.checklist]
    
    routine = RoutineService.update(
        db,
        routine_id=routine_id,
        name=request.name,
        description=request.description,
        target_ids=request.target_ids,
        checklist=checklist_data,
        note=request.note
    )
    
    # 构建响应
    targets = [TargetResponse.model_validate(target) for target in routine.targets]
    checklist = [ChecklistItem(**item) for item in RoutineService.get_checklist(routine)]
    
    # 处理训练关联
    workout_response = None
    if routine.workout:
        gym_response = GymResponse(
            id=routine.workout.gym.id,
            name=routine.workout.gym.name,
            location=routine.workout.gym.location
        )
        workout_targets = [TargetResponse.model_validate(target) for target in routine.workout.targets]
        workout_response = WorkoutSummaryResponse(
            id=routine.workout.id,
            start_time=routine.workout.start_time,
            end_time=routine.workout.end_time,
            gym=gym_response,
            target=set(workout_targets),
            note=routine.workout.note
        )
    
    # 处理训练槽关联
    slots = []
    for slot in routine.slots:
        exercise_response = ExerciseResponse(
            id=slot.exercise.id,
            name=slot.exercise.name,
            description=slot.exercise.description,
            main_muscles=set(),
            support_muscles=set(),
            cues=[]
        )
        slot_response = SlotSummaryResponse(
            id=slot.id,
            exercise=exercise_response,
            stars=slot.stars,
            category=slot.category,
            set_number=slot.set_number,
            weight=slot.weight,
            reps=slot.reps,
            duration=slot.duration,
            sequence=slot.sequence
        )
        slots.append(slot_response)
    
    response_data = RoutineResponse(
        id=routine.id,
        name=routine.name,
        description=routine.description,
        workout=workout_response,
        targets=set(targets),
        slots=set(slots),
        checklist=checklist,
        note=routine.note
    )
    
    return Response(data=response_data)


@router.get("", response_model=Response)
async def get_all_routines(
    page: int = Query(0, ge=0, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页大小"),
    name: Optional[str] = Query(None, description="训练计划名称"),
    db: Session = Depends(get_db)
):
    """获取所有训练计划"""
    skip = page * size
    routines = RoutineService.get_all(db, name=name, skip=skip, limit=size)
    total = RoutineService.get_total_count(db, name=name)
    
    items = []
    for routine in routines:
        targets = [TargetResponse.model_validate(target) for target in routine.targets]
        checklist = [ChecklistItem(**item) for item in RoutineService.get_checklist(routine)]
        
        item = RoutineResponse(
            id=routine.id,
            name=routine.name,
            description=routine.description,
            workout=None,
            targets=set(targets),
            slots=set(),
            checklist=checklist,
            note=routine.note
        )
        items.append(item)
    
    page_response = PageResponse(
        total=total,
        page=page,
        size=size,
        items=items
    )
    
    return Response(data=page_response)


@router.post("/exercise", response_model=Response)
async def add_exercise(request: SlotRequest, db: Session = Depends(get_db)):
    """向训练计划添加练习"""
    slot = SlotService.create(
        db,
        routine_id=request.routine_id,
        exercise_id=request.exercise_id,
        stars=request.stars,
        category=request.category,
        set_number=request.set_number,
        weight=request.weight,
        reps=request.reps,
        duration=request.duration,
        sequence=request.sequence
    )
    
    # 构建响应
    routine_summary = RoutineSummaryResponse(
        id=slot.routine.id,
        name=slot.routine.name,
        description=slot.routine.description,
        targets=set()
    )
    
    exercise_response = ExerciseResponse(
        id=slot.exercise.id,
        name=slot.exercise.name,
        description=slot.exercise.description,
        main_muscles=set(),
        support_muscles=set(),
        cues=[]
    )
    
    slot_response = SlotResponse(
        id=slot.id,
        routine=routine_summary,
        exercise=exercise_response,
        stars=slot.stars,
        category=slot.category,
        set_number=slot.set_number,
        weight=slot.weight,
        reps=slot.reps,
        duration=slot.duration,
        sequence=slot.sequence
    )
    
    return Response(data=slot_response)
