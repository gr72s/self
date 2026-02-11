from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.gym import Gym
from app.core.exceptions import NotFoundException, EntityAlreadyExistException


class GymService:
    """健身房服务"""
    
    @staticmethod
    def create(db: Session, name: str, location: str) -> Gym:
        """创建健身房"""
        # 检查是否已存在同名健身房
        existing_gym = db.query(Gym).filter(Gym.name == name).first()
        if existing_gym:
            raise EntityAlreadyExistException("Gym with this name already exists")
        
        gym = Gym(name=name, location=location)
        db.add(gym)
        db.commit()
        db.refresh(gym)
        return gym
    
    @staticmethod
    def update(db: Session, gym_id: int, name: str, location: str) -> Gym:
        """更新健身房"""
        gym = GymService.get_by_id(db, gym_id)
        
        # 检查是否与其他健身房同名
        if name != gym.name:
            existing_gym = db.query(Gym).filter(Gym.name == name).first()
            if existing_gym:
                raise EntityAlreadyExistException("Gym with this name already exists")
        
        gym.name = name
        gym.location = location
        db.commit()
        db.refresh(gym)
        return gym
    
    @staticmethod
    def get_by_id(db: Session, gym_id: int) -> Gym:
        """根据ID获取健身房"""
        gym = db.query(Gym).filter(Gym.id == gym_id).first()
        if not gym:
            raise NotFoundException("Gym not found")
        return gym
    
    @staticmethod
    def get_all(db: Session, name: Optional[str] = None, skip: int = 0, limit: int = 20) -> List[Gym]:
        """获取所有健身房"""
        query = db.query(Gym)
        
        if name:
            query = query.filter(Gym.name.ilike(f"%{name}%"))
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_total_count(db: Session, name: Optional[str] = None) -> int:
        """获取健身房总数"""
        query = db.query(Gym)
        
        if name:
            query = query.filter(Gym.name.ilike(f"%{name}%"))
        
        return query.count()
