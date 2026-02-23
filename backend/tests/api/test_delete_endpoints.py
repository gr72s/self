from app.models.exercise import Exercise
from app.models.gym import Gym
from app.models.muscle import Muscle
from app.models.routine import Routine
from app.models.slot import Category, Slot
from app.models.workout import Workout


def _error_message(payload: dict) -> str:
    return payload.get("detail") or payload.get("message") or ""


def test_delete_gym_success(client, db):
    gym = Gym(name="可删除健身房", location="测试地点")
    db.add(gym)
    db.commit()
    db.refresh(gym)

    response = client.delete(f"/api/lifting/gym/{gym.id}")

    assert response.status_code == 200
    assert db.query(Gym).filter(Gym.id == gym.id).first() is None


def test_delete_gym_conflict_when_referenced_by_workout(client, db):
    gym = Gym(name="被引用健身房", location="测试地点")
    db.add(gym)
    db.commit()
    db.refresh(gym)

    workout = Workout(gym_id=gym.id, note="关联训练")
    db.add(workout)
    db.commit()

    response = client.delete(f"/api/lifting/gym/{gym.id}")

    assert response.status_code == 409
    assert "无法删除" in _error_message(response.json())


def test_delete_gym_not_found(client):
    response = client.delete("/api/lifting/gym/999999")
    assert response.status_code == 404


def test_delete_workout_success(client, db):
    gym = Gym(name="训练删除健身房", location="测试地点")
    db.add(gym)
    db.commit()
    db.refresh(gym)

    workout = Workout(gym_id=gym.id, note="可删除训练")
    db.add(workout)
    db.commit()
    db.refresh(workout)

    response = client.delete(f"/api/lifting/workout/{workout.id}")

    assert response.status_code == 200
    assert db.query(Workout).filter(Workout.id == workout.id).first() is None


def test_delete_workout_conflict_when_referenced_by_routine(client, db):
    gym = Gym(name="训练冲突健身房", location="测试地点")
    db.add(gym)
    db.commit()
    db.refresh(gym)

    workout = Workout(gym_id=gym.id, note="被计划引用训练")
    db.add(workout)
    db.commit()
    db.refresh(workout)

    routine = Routine(name="引用训练计划", template=False, workout_id=workout.id)
    db.add(routine)
    db.commit()

    response = client.delete(f"/api/lifting/workout/{workout.id}")

    assert response.status_code == 409
    assert "无法删除" in _error_message(response.json())


def test_delete_workout_not_found(client):
    response = client.delete("/api/lifting/workout/999999")
    assert response.status_code == 404


def test_delete_routine_success_with_slots_cascade(client, db):
    routine = Routine(name="可删除训练计划", template=True)
    exercise = Exercise(name="深蹲")
    db.add_all([routine, exercise])
    db.commit()
    db.refresh(routine)
    db.refresh(exercise)

    slot = Slot(
        routine_id=routine.id,
        exercise_id=exercise.id,
        category=Category.WorkingSets,
        sequence=1,
        stars=3
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)

    response = client.delete(f"/api/lifting/routine/{routine.id}")

    assert response.status_code == 200
    assert db.query(Routine).filter(Routine.id == routine.id).first() is None
    assert db.query(Slot).filter(Slot.id == slot.id).first() is None


def test_delete_routine_not_found(client):
    response = client.delete("/api/lifting/routine/999999")
    assert response.status_code == 404


def test_delete_exercise_success(client, db):
    exercise = Exercise(name="可删除动作")
    db.add(exercise)
    db.commit()
    db.refresh(exercise)

    response = client.delete(f"/api/lifting/exercise/{exercise.id}")

    assert response.status_code == 200
    assert db.query(Exercise).filter(Exercise.id == exercise.id).first() is None


def test_delete_exercise_conflict_when_referenced_by_slot(client, db):
    routine = Routine(name="动作冲突计划", template=True)
    exercise = Exercise(name="卧推")
    db.add_all([routine, exercise])
    db.commit()
    db.refresh(routine)
    db.refresh(exercise)

    slot = Slot(
        routine_id=routine.id,
        exercise_id=exercise.id,
        category=Category.WorkingSets,
        sequence=1,
        stars=4
    )
    db.add(slot)
    db.commit()

    response = client.delete(f"/api/lifting/exercise/{exercise.id}")

    assert response.status_code == 409
    assert "无法删除" in _error_message(response.json())


def test_delete_exercise_not_found(client):
    response = client.delete("/api/lifting/exercise/999999")
    assert response.status_code == 404


def test_delete_muscle_success(client, db):
    muscle = Muscle(name="可删除肌肉")
    db.add(muscle)
    db.commit()
    db.refresh(muscle)

    response = client.delete(f"/api/lifting/muscle/{muscle.id}")

    assert response.status_code == 200
    assert db.query(Muscle).filter(Muscle.id == muscle.id).first() is None


def test_delete_muscle_conflict_when_referenced_by_exercise(client, db):
    muscle = Muscle(name="被引用肌肉")
    exercise = Exercise(name="硬拉")
    exercise.main_muscles = [muscle]
    db.add_all([muscle, exercise])
    db.commit()
    db.refresh(muscle)

    response = client.delete(f"/api/lifting/muscle/{muscle.id}")

    assert response.status_code == 409
    assert "无法删除" in _error_message(response.json())


def test_delete_muscle_not_found(client):
    response = client.delete("/api/lifting/muscle/999999")
    assert response.status_code == 404
