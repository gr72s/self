from typing import Optional, List, Set
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.workout import Workout
from app.services.gym import GymService
from app.services.target import TargetService
from app.core.exceptions import NotFoundException


class WorkoutService:
    """训练服务"""
    
    @staticmethod
    def create(db: Session, start_time: Optional[datetime] = None, gym_id: int = None, 
               routine_id: Optional[int] = None, target_ids: Set[int] = None, 
               note: Optional[str] = None) -> Workout:
        """创建训练"""
        # 获取健身房对象
        gym = GymService.get_by_id(db, gym_id)
        
        # 获取训练计划对象
        routine = None
        if routine_id:
            from app.services.routine import RoutineService
            routine = RoutineService.get_by_id(db, routine_id)
        
        # 获取目标对象
        targets = []
        if target_ids:
            targets = [TargetService.get_by_id(db, target_id) for target_id in target_ids]
        
        # 处理开始时间
        actual_start_time = start_time or datetime.now()
        
        workout = Workout(
            start_time=actual_start_time,
            end_time=None,
            gym=gym,
            note=note
        )
        
        # 添加关联关系
        if routine:
            workout.routine = routine
        workout.targets = targets
        
        db.add(workout)
        db.commit()
        db.refresh(workout)
        return workout
    
    @staticmethod
    def update(db: Session, workout_id: int, start_time: Optional[datetime] = None, 
               end_time: Optional[datetime] = None, gym_id: int = None, 
               routine_id: Optional[int] = None, target_ids: Set[int] = None, 
               note: Optional[str] = None) -> Workout:
        """更新训练"""
        workout = WorkoutService.get_by_id(db, workout_id)
        
        # 获取健身房对象
        if gym_id:
            gym = GymService.get_by_id(db, gym_id)
            workout.gym = gym
        
        # 获取训练计划对象
        if routine_id:
            from app.services.routine import RoutineService
            routine = RoutineService.get_by_id(db, routine_id)
            workout.routine = routine
        
        # 获取目标对象
        if target_ids:
            targets = [TargetService.get_by_id(db, target_id) for target_id in target_ids]
            workout.targets = targets
        
        # 更新属性
        if start_time:
            workout.start_time = start_time
        if end_time:
            workout.end_time = end_time
        if note is not None:
            workout.note = note
        
        db.commit()
        db.refresh(workout)
        return workout
    
    @staticmethod
    def get_by_id(db: Session, workout_id: int) -> Workout:
        """根据ID获取训练"""
        workout = db.query(Workout).filter(Workout.id == workout_id).first()
        if not workout:
            raise NotFoundException("Workout not found")
        return workout
    
    @staticmethod
    def get_all(db: Session, start_date: Optional[datetime] = None, 
                end_date: Optional[datetime] = None, skip: int = 0, limit: int = 20) -> List[Workout]:
        """获取所有训练"""
        query = db.query(Workout)
        
        if start_date and end_date:
            query = query.filter(Workout.start_time.between(start_date, end_date))
        
        return query.order_by(Workout.start_time.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_total_count(db: Session, start_date: Optional[datetime] = None, 
                        end_date: Optional[datetime] = None) -> int:
        """获取训练总数"""
        query = db.query(Workout)
        
        if start_date and end_date:
            query = query.filter(Workout.start_time.between(start_date, end_date))
        
        return query.count()
    
    @staticmethod
    def find_in_process_workout(db: Session) -> Optional[Workout]:
        """查找进行中的训练"""
        # 查找今天开始但未结束的训练
        today = datetime.now().date()
        start_of_day = datetime(today.year, today.month, today.day, 0, 0, 0)
        
        workout = db.query(Workout).filter(
            Workout.start_time >= start_of_day,
            Workout.end_time.is_(None)
        ).order_by(Workout.start_time.desc()).first()
        
        return workout
