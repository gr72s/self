from typing import Optional
from sqlalchemy.orm import Session
from app.models.slot import Slot, Category
from app.services.routine import RoutineService
from app.services.exercise import ExerciseService
from app.core.exceptions import NotFoundException


class SlotService:
    """训练槽服务"""
    
    @staticmethod
    def create(db: Session, routine_id: int, exercise_id: int, stars: int, 
               category: Category, set_number: Optional[int] = None, 
               weight: Optional[float] = None, reps: Optional[int] = None, 
               duration: Optional[int] = 0, sequence: int = 0) -> Slot:
        """创建训练槽"""
        # 获取训练计划对象
        routine = RoutineService.get_by_id(db, routine_id)
        
        # 获取练习对象
        exercise = ExerciseService.get_by_id(db, exercise_id)
        
        slot = Slot(
            routine=routine,
            exercise=exercise,
            stars=stars,
            category=category,
            set_number=set_number,
            weight=weight,
            reps=reps,
            duration=duration,
            sequence=sequence
        )
        
        db.add(slot)
        db.commit()
        db.refresh(slot)
        return slot
    
    @staticmethod
    def get_by_id(db: Session, slot_id: int) -> Slot:
        """根据ID获取训练槽"""
        slot = db.query(Slot).filter(Slot.id == slot_id).first()
        if not slot:
            raise NotFoundException("Slot not found")
        return slot
    
    @staticmethod
    def get_by_routine(db: Session, routine_id: int) -> list[Slot]:
        """根据训练计划获取训练槽"""
        # 验证训练计划是否存在
        RoutineService.get_by_id(db, routine_id)
        
        return db.query(Slot).filter(Slot.routine_id == routine_id).order_by(Slot.sequence).all()
