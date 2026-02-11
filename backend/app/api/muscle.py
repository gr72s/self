from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.muscle import MuscleService
from app.schemas.muscle import MuscleRequest, MuscleResponse
from app.schemas.response import Response, PageResponse

router = APIRouter()


@router.post("", response_model=Response)
async def create_muscle(request: MuscleRequest, db: Session = Depends(get_db)):
    """创建肌肉"""
    muscle = MuscleService.create(
        db,
        name=request.name,
        description=request.description,
        function=request.function,
        origin_name=request.origin_name
    )
    return Response(data=MuscleResponse.model_validate(muscle))


@router.put("/{muscle_id}", response_model=Response)
async def update_muscle(muscle_id: int, request: MuscleRequest, db: Session = Depends(get_db)):
    """更新肌肉"""
    muscle = MuscleService.update(
        db,
        muscle_id=muscle_id,
        name=request.name,
        description=request.description,
        function=request.function,
        origin_name=request.origin_name
    )
    return Response(data=MuscleResponse.model_validate(muscle))


@router.get("", response_model=Response)
async def get_all_muscles(
    page: int = Query(0, ge=0, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页大小"),
    name: Optional[str] = Query(None, description="肌肉名称"),
    db: Session = Depends(get_db)
):
    """获取所有肌肉"""
    skip = page * size
    muscles = MuscleService.get_all(db, name=name, skip=skip, limit=size)
    total = MuscleService.get_total_count(db, name=name)
    
    items = [MuscleResponse.model_validate(muscle) for muscle in muscles]
    page_response = PageResponse(
        total=total,
        page=page,
        size=size,
        items=items
    )
    
    return Response(data=page_response)


@router.get("/{muscle_id}", response_model=Response)
async def get_muscle(muscle_id: int, db: Session = Depends(get_db)):
    """根据ID获取肌肉"""
    muscle = MuscleService.get_by_id(db, muscle_id)
    return Response(data=MuscleResponse.model_validate(muscle))
