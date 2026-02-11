from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class Category(str, enum.Enum):
    """训练槽类别枚举"""
    Mobility = "Mobility"
    WarmUp = "WarmUp"
    Activation = "Activation"
    WorkingSets = "WorkingSets"
    Corrective = "Corrective"
    Aerobic = "Aerobic"
    CoolDown = "CoolDown"


class Slot(Base):
    """训练槽模型"""
    __tablename__ = "lifting_slot"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    stars = Column(Integer, nullable=False, default=0)
    category = Column(Enum(Category), nullable=False, default=Category.WorkingSets)
    set_number = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True)
    reps = Column(Integer, nullable=True)
    duration = Column(Integer, nullable=True, default=0)
    sequence = Column(Integer, nullable=False, default=0)
    
    # 关联关系
    exercise_id = Column(Integer, ForeignKey('lifting_exercise.id'), nullable=False)
    exercise = relationship("Exercise", backref="slots")
    
    routine_id = Column(Integer, ForeignKey('lifting_routine.id'), nullable=False)
    routine = relationship("Routine", back_populates="slots")
