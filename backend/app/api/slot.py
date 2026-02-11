from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.slot import SlotService
from app.schemas.slot import SlotResponse
from app.schemas.routine import RoutineSummaryResponse
from app.schemas.exercise import ExerciseResponse
from app.schemas.response import Response

router = APIRouter()


@router.get("/{slot_id}", response_model=Response)
async def get_slot(slot_id: int, db: Session = Depends(get_db)):
    """根据ID获取训练槽"""
    slot = SlotService.get_by_id(db, slot_id)
    
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
    
    response_data = SlotResponse(
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
    
    return Response(data=response_data)


@router.get("/routine/{routine_id}", response_model=Response)
async def get_slots_by_routine(routine_id: int, db: Session = Depends(get_db)):
    """根据训练计划获取训练槽"""
    slots = SlotService.get_by_routine(db, routine_id)
    
    items = []
    for slot in slots:
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
        items.append(slot_response)
    
    return Response(data=items)
