from typing import Optional, List, Set
from sqlalchemy.orm import Session
from app.models.exercise import Exercise
from app.services.muscle import MuscleService
from app.core.exceptions import NotFoundException


class ExerciseService:
    """练习服务"""
    
    @staticmethod
    def create(db: Session, name: str, description: Optional[str] = None, 
               main_muscle_ids: Set[int] = None, support_muscle_ids: Set[int] = None, 
               cues: List[str] = None) -> Exercise:
        """创建练习"""
        # 获取肌肉对象
        main_muscles = []
        if main_muscle_ids:
            main_muscles = [MuscleService.get_by_id(db, muscle_id) for muscle_id in main_muscle_ids]
        
        support_muscles = []
        if support_muscle_ids:
            support_muscles = [MuscleService.get_by_id(db, muscle_id) for muscle_id in support_muscle_ids]
        
        # 处理cues
        cues_str = None
        if cues:
            cues_str = ",".join(cues)
        
        exercise = Exercise(
            name=name,
            description=description,
            cues=cues_str
        )
        
        # 添加关联关系
        exercise.main_muscles = main_muscles
        exercise.support_muscles = support_muscles
        
        db.add(exercise)
        db.commit()
        db.refresh(exercise)
        return exercise
    
    @staticmethod
    def update(db: Session, exercise_id: int, name: str, description: Optional[str] = None, 
               main_muscle_ids: Set[int] = None, support_muscle_ids: Set[int] = None, 
               cues: List[str] = None) -> Exercise:
        """更新练习"""
        exercise = ExerciseService.get_by_id(db, exercise_id)
        
        # 获取肌肉对象
        main_muscles = []
        if main_muscle_ids:
            main_muscles = [MuscleService.get_by_id(db, muscle_id) for muscle_id in main_muscle_ids]
        
        support_muscles = []
        if support_muscle_ids:
            support_muscles = [MuscleService.get_by_id(db, muscle_id) for muscle_id in support_muscle_ids]
        
        # 处理cues
        cues_str = None
        if cues:
            cues_str = ",".join(cues)
        
        # 更新属性
        exercise.name = name
        exercise.description = description
        exercise.cues = cues_str
        
        # 更新关联关系
        exercise.main_muscles = main_muscles
        exercise.support_muscles = support_muscles
        
        db.commit()
        db.refresh(exercise)
        return exercise
    
    @staticmethod
    def get_by_id(db: Session, exercise_id: int) -> Exercise:
        """根据ID获取练习"""
        exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
        if not exercise:
            raise NotFoundException("Exercise not found")
        return exercise
    
    @staticmethod
    def get_all(db: Session, name: Optional[str] = None, skip: int = 0, limit: int = 20) -> List[Exercise]:
        """获取所有练习"""
        query = db.query(Exercise)
        
        if name:
            query = query.filter(Exercise.name.ilike(f"%{name}%"))
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_total_count(db: Session, name: Optional[str] = None) -> int:
        """获取练习总数"""
        query = db.query(Exercise)
        
        if name:
            query = query.filter(Exercise.name.ilike(f"%{name}%"))
        
        return query.count()
    
    @staticmethod
    def get_cues_list(exercise: Exercise) -> List[str]:
        """获取练习提示列表"""
        if not exercise.cues:
            return []
        return exercise.cues.split(",")
