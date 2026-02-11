from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.target import TargetService
from app.schemas.target import TargetResponse
from app.schemas.response import Response

router = APIRouter()


@router.get("", response_model=Response)
async def get_all_targets(db: Session = Depends(get_db)):
    """获取所有目标"""
    targets = TargetService.get_all(db)
    items = [TargetResponse.model_validate(target) for target in targets]
    return Response(data=items)


@router.get("/{target_id}", response_model=Response)
async def get_target(target_id: int, db: Session = Depends(get_db)):
    """根据ID获取目标"""
    target = TargetService.get_by_id(db, target_id)
    return Response(data=TargetResponse.model_validate(target))
