from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.muscle import Muscle
from app.core.exceptions import NotFoundException


class MuscleService:
    """肌肉服务"""
    
    @staticmethod
    def create(db: Session, name: str, description: Optional[str] = None, 
               function: Optional[str] = None, origin_name: Optional[str] = None) -> Muscle:
        """创建肌肉"""
        muscle = Muscle(
            name=name,
            description=description,
            function=function,
            origin_name=origin_name
        )
        db.add(muscle)
        db.commit()
        db.refresh(muscle)
        return muscle
    
    @staticmethod
    def update(db: Session, muscle_id: int, name: str, description: Optional[str] = None, 
               function: Optional[str] = None, origin_name: Optional[str] = None) -> Muscle:
        """更新肌肉"""
        muscle = MuscleService.get_by_id(db, muscle_id)
        muscle.name = name
        muscle.description = description
        muscle.function = function
        muscle.origin_name = origin_name
        db.commit()
        db.refresh(muscle)
        return muscle
    
    @staticmethod
    def get_by_id(db: Session, muscle_id: int) -> Muscle:
        """根据ID获取肌肉"""
        muscle = db.query(Muscle).filter(Muscle.id == muscle_id).first()
        if not muscle:
            raise NotFoundException("Muscle not found")
        return muscle
    
    @staticmethod
    def get_all(db: Session, name: Optional[str] = None, skip: int = 0, limit: int = 20) -> List[Muscle]:
        """获取所有肌肉"""
        query = db.query(Muscle)
        
        if name:
            query = query.filter(Muscle.name.ilike(f"%{name}%"))
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_total_count(db: Session, name: Optional[str] = None) -> int:
        """获取肌肉总数"""
        query = db.query(Muscle)
        
        if name:
            query = query.filter(Muscle.name.ilike(f"%{name}%"))
        
        return query.count()
