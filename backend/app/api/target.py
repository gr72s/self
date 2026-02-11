from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.target import TargetService
from app.schemas.target import TargetRequest, TargetResponse
from app.schemas.response import Response, PageResponse

router = APIRouter()


@router.post("", response_model=Response)
async def create_target(request: TargetRequest, db: Session = Depends(get_db)):
    """创建目标"""
    target = TargetService.create(db, name=request.name)
    return Response(data=TargetResponse.model_validate(target))


@router.get("", response_model=Response)
async def get_all_targets(
    page: int = Query(0, ge=0, description="页码"),
    size: int = Query(20, ge=1, le=100, description="每页大小"),
    db: Session = Depends(get_db)
):
    """获取所有目标"""
    skip = page * size
    targets = TargetService.get_all(db, skip=skip, limit=size)
    total = TargetService.get_total_count(db)
    
    items = [TargetResponse.model_validate(target) for target in targets]
    page_response = PageResponse(
        total=total,
        page=page,
        size=size,
        items=items
    )
    return Response(data=page_response)


@router.get("/{target_id}", response_model=Response)
async def get_target(target_id: int, db: Session = Depends(get_db)):
    """根据ID获取目标"""
    target = TargetService.get_by_id(db, target_id)
    return Response(data=TargetResponse.model_validate(target))
