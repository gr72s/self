from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.gym import GymService
from app.schemas.gym import GymRequest, GymResponse
from app.schemas.response import Response, PageResponse

router = APIRouter()


@router.post("", response_model=Response)
async def create_gym(request: GymRequest, db: Session = Depends(get_db)):
    """创建健身房"""
    gym = GymService.create(
        db,
        name=request.name,
        location=request.location
    )
    return Response(data=GymResponse.model_validate(gym))


@router.put("/{gym_id}", response_model=Response)
async def update_gym(gym_id: int, request: GymRequest, db: Session = Depends(get_db)):
    """更新健身房"""
    gym = GymService.update(
        db,
        gym_id=gym_id,
        name=request.name,
        location=request.location
    )
    return Response(data=GymResponse.model_validate(gym))


@router.get("", response_model=Response)
async def get_all_gyms(
    page: int = Query(0, ge=0, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页大小"),
    name: Optional[str] = Query(None, description="健身房名称"),
    db: Session = Depends(get_db)
):
    """获取所有健身房"""
    skip = page * size
    gyms = GymService.get_all(db, name=name, skip=skip, limit=size)
    total = GymService.get_total_count(db, name=name)
    
    items = [GymResponse.model_validate(gym) for gym in gyms]
    page_response = PageResponse(
        total=total,
        page=page,
        size=size,
        items=items
    )
    
    return Response(data=page_response)


@router.get("/{gym_id}", response_model=Response)
async def get_gym(gym_id: int, db: Session = Depends(get_db)):
    """根据ID获取健身房"""
    gym = GymService.get_by_id(db, gym_id)
    return Response(data=GymResponse.model_validate(gym))
