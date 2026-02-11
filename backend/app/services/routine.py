import json
from typing import Optional, List, Set
from sqlalchemy.orm import Session
from app.models.routine import Routine
from app.services.target import TargetService
from app.core.exceptions import NotFoundException


class RoutineService:
    """训练计划服务"""
    
    @staticmethod
    def create(db: Session, name: str, description: Optional[str] = None, 
               workout_id: Optional[int] = None, target_ids: Set[int] = None, 
               checklist: List[dict] = None, note: Optional[str] = None) -> Routine:
        """创建训练计划"""
        # 获取目标对象
        targets = []
        if target_ids:
            targets = [TargetService.get_by_id(db, target_id) for target_id in target_ids]
        
        # 获取训练对象
        workout = None
        if workout_id:
            from app.services.workout import WorkoutService
            workout = WorkoutService.get_by_id(db, workout_id)
        
        # 处理checklist
        checklist_str = None
        if checklist:
            checklist_str = json.dumps(checklist)
        
        # 确定是否为模板
        template = workout_id is None
        
        routine = Routine(
            name=name,
            description=description,
            template=template,
            note=note,
            checklist=checklist_str
        )
        
        # 添加关联关系
        if workout:
            routine.workout = workout
        routine.targets = targets
        
        db.add(routine)
        db.commit()
        db.refresh(routine)
        return routine
    
    @staticmethod
    def update(db: Session, routine_id: int, name: str, description: Optional[str] = None, 
               target_ids: Set[int] = None, checklist: List[dict] = None, 
               note: Optional[str] = None) -> Routine:
        """更新训练计划"""
        routine = RoutineService.get_by_id(db, routine_id)
        
        # 获取目标对象
        targets = []
        if target_ids:
            targets = [TargetService.get_by_id(db, target_id) for target_id in target_ids]
        
        # 处理checklist
        checklist_str = None
        if checklist:
            checklist_str = json.dumps(checklist)
        
        # 更新属性
        routine.name = name
        routine.description = description
        routine.note = note
        routine.checklist = checklist_str
        
        # 更新关联关系
        routine.targets = targets
        
        db.commit()
        db.refresh(routine)
        return routine
    
    @staticmethod
    def get_by_id(db: Session, routine_id: int) -> Routine:
        """根据ID获取训练计划"""
        routine = db.query(Routine).filter(Routine.id == routine_id).first()
        if not routine:
            raise NotFoundException("Routine not found")
        return routine
    
    @staticmethod
    def get_all(db: Session, name: Optional[str] = None, skip: int = 0, limit: int = 20) -> List[Routine]:
        """获取所有训练计划"""
        query = db.query(Routine)
        
        if name:
            query = query.filter(Routine.name.ilike(f"%{name}%"))
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_total_count(db: Session, name: Optional[str] = None) -> int:
        """获取训练计划总数"""
        query = db.query(Routine)
        
        if name:
            query = query.filter(Routine.name.ilike(f"%{name}%"))
        
        return query.count()
    
    @staticmethod
    def get_checklist(routine: Routine) -> List[dict]:
        """获取训练计划检查项"""
        if not routine.checklist:
            return []
        try:
            return json.loads(routine.checklist)
        except json.JSONDecodeError:
            return []
