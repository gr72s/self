from sqlalchemy import Column, Integer, String, Text, Boolean, Table, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


# 训练计划与目标的多对多关系表
routine_target = Table(
    'lifting_routine_target',
    Base.metadata,
    Column('routine_id', Integer, ForeignKey('lifting_routine.id'), primary_key=True),
    Column('target_id', Integer, ForeignKey('lifting_target.id'), primary_key=True)
)


class Routine(Base):
    """训练计划模型"""
    __tablename__ = "lifting_routine"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    template = Column(Boolean, nullable=False, default=False)
    note = Column(Text, nullable=True)
    checklist = Column(Text, nullable=True)  # 使用Text存储checklist列表，以JSON格式存储
    
    # 关联关系
    workout_id = Column(Integer, ForeignKey('lifting_workout.id'), nullable=True)
    workout = relationship("Workout", backref="routine", uselist=False)
    
    targets = relationship(
        "Target",
        secondary=routine_target,
        backref="routines"
    )
    
    slots = relationship("Slot", back_populates="routine", cascade="all, delete-orphan")
