from sqlalchemy import Column, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


main_muscle_exercise = Table(
    "lifting_main_muscle_exercise",
    Base.metadata,
    Column("exercise_id", Integer, ForeignKey("lifting_exercise.id"), primary_key=True),
    Column("muscle_id", Integer, ForeignKey("lifting_muscle.id"), primary_key=True),
)

support_muscle_exercise = Table(
    "lifting_support_muscle_exercise",
    Base.metadata,
    Column("exercise_id", Integer, ForeignKey("lifting_exercise.id"), primary_key=True),
    Column("muscle_id", Integer, ForeignKey("lifting_muscle.id"), primary_key=True),
)


class Exercise(Base):
    __tablename__ = "lifting_exercise"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    keypoint = Column(Text, nullable=True)
    origin_name = Column(String(255), nullable=True)
    cues = Column(Text, nullable=True)

    main_muscles = relationship(
        "Muscle",
        secondary=main_muscle_exercise,
        backref="main_exercises",
    )
    support_muscles = relationship(
        "Muscle",
        secondary=support_muscle_exercise,
        backref="support_exercises",
    )
