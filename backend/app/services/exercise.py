from typing import List, Optional, Set

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException
from app.core.write_guard import commit_create, commit_update
from app.models.exercise import Exercise
from app.services.muscle import MuscleService


class ExerciseService:
    @staticmethod
    def create(
        db: Session,
        name: str,
        description: Optional[str] = None,
        keypoint: Optional[str] = None,
        origin_name: Optional[str] = None,
        main_muscle_ids: Optional[Set[int]] = None,
        support_muscle_ids: Optional[Set[int]] = None,
        cues: Optional[List[str]] = None,
    ) -> Exercise:
        main_muscles = []
        if main_muscle_ids:
            main_muscles = [MuscleService.get_by_id(db, muscle_id) for muscle_id in main_muscle_ids]

        support_muscles = []
        if support_muscle_ids:
            support_muscles = [MuscleService.get_by_id(db, muscle_id) for muscle_id in support_muscle_ids]

        cues_str = ",".join(cues) if cues else None

        exercise = Exercise(
            name=name,
            description=description,
            keypoint=keypoint,
            origin_name=origin_name,
            cues=cues_str,
        )
        exercise.main_muscles = main_muscles
        exercise.support_muscles = support_muscles

        db.add(exercise)
        commit_create(db, exercise)
        return exercise

    @staticmethod
    def update(
        db: Session,
        exercise_id: int,
        name: str,
        description: Optional[str] = None,
        keypoint: Optional[str] = None,
        origin_name: Optional[str] = None,
        main_muscle_ids: Optional[Set[int]] = None,
        support_muscle_ids: Optional[Set[int]] = None,
        cues: Optional[List[str]] = None,
    ) -> Exercise:
        exercise = ExerciseService.get_by_id(db, exercise_id)

        main_muscles = []
        if main_muscle_ids:
            main_muscles = [MuscleService.get_by_id(db, muscle_id) for muscle_id in main_muscle_ids]

        support_muscles = []
        if support_muscle_ids:
            support_muscles = [MuscleService.get_by_id(db, muscle_id) for muscle_id in support_muscle_ids]

        cues_str = ",".join(cues) if cues else None

        exercise.name = name
        exercise.description = description
        exercise.keypoint = keypoint
        exercise.origin_name = origin_name
        exercise.cues = cues_str
        exercise.main_muscles = main_muscles
        exercise.support_muscles = support_muscles

        commit_update(db, exercise)
        return exercise

    @staticmethod
    def get_by_id(db: Session, exercise_id: int) -> Exercise:
        exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
        if not exercise:
            raise NotFoundException("Exercise not found")
        return exercise

    @staticmethod
    def get_all(
        db: Session, name: Optional[str] = None, skip: int = 0, limit: int = 20
    ) -> List[Exercise]:
        query = db.query(Exercise)
        if name:
            query = query.filter(Exercise.name.ilike(f"%{name}%"))
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_total_count(db: Session, name: Optional[str] = None) -> int:
        query = db.query(Exercise)
        if name:
            query = query.filter(Exercise.name.ilike(f"%{name}%"))
        return query.count()

    @staticmethod
    def get_cues_list(exercise: Exercise) -> List[str]:
        if not exercise.cues:
            return []
        return exercise.cues.split(",")
