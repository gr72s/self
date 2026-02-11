from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.target import Target
from app.core.exceptions import NotFoundException


class TargetService:
    """目标服务"""
    
    @staticmethod
    def get_by_id(db: Session, target_id: int) -> Target:
        """根据ID获取目标"""
        target = db.query(Target).filter(Target.id == target_id).first()
        if not target:
            raise NotFoundException("Target not found")
        return target
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Target]:
        """获取所有目标"""
        return db.query(Target).offset(skip).limit(limit).all()
    
    @staticmethod
    def create(db: Session, name: str) -> Target:
        """创建目标"""
        target = Target(name=name)
        db.add(target)
        db.commit()
        db.refresh(target)
        return target
