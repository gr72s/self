def test_get_slot_by_id(client, db):
    """测试根据ID获取训练槽"""
    # 1. 先创建必要的资源
    # 创建肌肉
    muscle_response = client.post(
        "/api/lifting/muscle",
        json={
            "name": "测试肌肉",
            "description": "这是一块测试肌肉",
            "function": "测试功能",
            "origin_name": "测试起点"
        }
    )
    muscle_id = muscle_response.json()["data"]["id"]

    # 创建练习
    exercise_response = client.post(
        "/api/lifting/exercise",
        json={
            "name": "测试练习",
            "description": "这是一个测试练习",
            "main_muscles": [muscle_id],
            "support_muscles": [],
            "cues": ["测试提示1"]
        }
    )
    exercise_id = exercise_response.json()["data"]["id"]

    # 创建目标
    from app.services.target import TargetService

    # 添加测试目标
    target = TargetService.create(db, name="测试目标")
    
    # 创建训练计划
    routine_response = client.post(
        "/api/lifting/routine",
        json={
            "name": "测试训练计划",
            "description": "这是一个测试训练计划",
            "workout_id": None,
            "target_ids": [target.id],
            "checklist": [],
            "note": "测试备注"
        }
    )
    routine_id = routine_response.json()["data"]["id"]
    
    # 向训练计划添加练习
    slot_response = client.post(
        "/api/lifting/routine/exercise",
        json={
            "routine_id": routine_id,
            "exercise_id": exercise_id,
            "stars": 5,
            "category": "WorkingSets",
            "set_number": 3,
            "weight": 100.0,
            "reps": 10,
            "duration": 0,
            "sequence": 1
        }
    )
    slot_id = slot_response.json()["data"]["id"]
    
    # 2. 根据ID获取训练槽
    response = client.get(f"/api/lifting/slot/{slot_id}")
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert data["data"]["id"] == slot_id


def test_get_slots_by_routine(client, db):
    """测试根据训练计划获取训练槽"""
    # 1. 先创建必要的资源
    # 创建肌肉
    muscle_response = client.post(
        "/api/lifting/muscle",
        json={
            "name": "测试肌肉",
            "description": "这是一块测试肌肉",
            "function": "测试功能",
            "origin_name": "测试起点"
        }
    )
    muscle_id = muscle_response.json()["data"]["id"]

    # 创建两个练习
    exercise_ids = []
    for i in range(2):
        exercise_response = client.post(
            "/api/lifting/exercise",
            json={
            "name": f"测试练习{i}",
            "description": f"这是一个测试练习{i}",
            "main_muscles": [muscle_id],
            "support_muscles": [],
            "cues": [f"测试提示1-{i}"]
        }
        )
        exercise_ids.append(exercise_response.json()["data"]["id"])

    # 创建目标
    from app.services.target import TargetService

    # 添加测试目标
    target = TargetService.create(db, name="测试目标")
    
    # 创建训练计划
    routine_response = client.post(
        "/api/lifting/routine",
        json={
            "name": "测试训练计划",
            "description": "这是一个测试训练计划",
            "workout_id": None,
            "target_ids": [target.id],
            "checklist": [],
            "note": "测试备注"
        }
    )
    routine_id = routine_response.json()["data"]["id"]
    
    # 向训练计划添加两个练习
    for i, exercise_id in enumerate(exercise_ids):
        client.post(
            "/api/lifting/routine/exercise",
            json={
                "routine_id": routine_id,
                "exercise_id": exercise_id,
                "stars": 5,
                "category": "WorkingSets",
                "set_number": 3,
                "weight": 100.0,
                "reps": 10,
                "duration": 0,
                "sequence": i + 1
            }
        )
    
    # 2. 根据训练计划获取训练槽
    response = client.get(f"/api/lifting/slot/routine/{routine_id}?page=0&size=10")
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert "total" in data["data"]
    assert "items" in data["data"]
    assert data["data"]["total"] >= 2
    assert len(data["data"]["items"]) >= 2
