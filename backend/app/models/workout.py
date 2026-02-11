from sqlalchemy import Column, Integer, String, Text, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


# 训练与目标的多对多关系表
workout_target = Table(
    'lifting_workout_target',
    Base.metadata,
    Column('workout_id', Integer, ForeignKey('lifting_workout.id'), primary_key=True),
    Column('target_id', Integer, ForeignKey('lifting_target.id'), primary_key=True)
)


class Workout(Base):
    """训练模型"""
    __tablename__ = "lifting_workout"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    note = Column(Text, nullable=True)
    
    # 关联关系
    gym_id = Column(Integer, ForeignKey('lifting_gym.id'), nullable=False)
    gym = relationship("Gym", backref="workouts")
    
    # 移除routine_id外键，因为一对一关系应该由Routine侧维护
    
    targets = relationship(
        "Target",
        secondary=workout_target,
        backref="workouts"
    )
