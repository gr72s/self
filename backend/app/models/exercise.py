from sqlalchemy import Column, Integer, String, Text, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


# 主肌肉与练习的多对多关系表
main_muscle_exercise = Table(
    'lifting_main_muscle_exercise',
    Base.metadata,
    Column('exercise_id', Integer, ForeignKey('lifting_exercise.id'), primary_key=True),
    Column('muscle_id', Integer, ForeignKey('lifting_muscle.id'), primary_key=True)
)

# 辅助肌肉与练习的多对多关系表
support_muscle_exercise = Table(
    'lifting_support_muscle_exercise',
    Base.metadata,
    Column('exercise_id', Integer, ForeignKey('lifting_exercise.id'), primary_key=True),
    Column('muscle_id', Integer, ForeignKey('lifting_muscle.id'), primary_key=True)
)


class Exercise(Base):
    """练习模型"""
    __tablename__ = "lifting_exercise"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    
    # 关联关系
    main_muscles = relationship(
        "Muscle",
        secondary=main_muscle_exercise,
        backref="main_exercises"
    )
    support_muscles = relationship(
        "Muscle",
        secondary=support_muscle_exercise,
        backref="support_exercises"
    )
    cues = Column(Text, nullable=True)  # 使用Text存储cues列表，以逗号分隔
