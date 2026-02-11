def test_create_routine_success(client, db):
    """测试创建训练计划成功"""
    # 1. 先创建一个目标
    from app.services.target import TargetService
    
    # 添加测试目标
    target = TargetService.create(db, name="测试目标")
    
    # 2. 创建训练计划
    response = client.post(
        "/api/lifting/routine",
        json={
            "name": "测试训练计划",
            "description": "这是一个测试训练计划",
            "workout_id": None,
            "target_ids": [target.id],
            "checklist": [
                {"name": "测试检查项1", "is_optional": False},
                {"name": "测试检查项2", "is_optional": True}
            ],
            "note": "测试备注"
        }
    )



    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert data["data"]["name"] == "测试训练计划"


def test_get_all_routines(client, db):
    """测试获取所有训练计划"""
    # 1. 先创建一个目标
    from app.services.target import TargetService
    
    # 添加测试目标
    target = TargetService.create(db, name="测试目标")
    
    # 2. 创建两个训练计划
    for i in range(2):
        client.post(
            "/api/lifting/routine",
            json={
            "name": f"测试训练计划{i}",
            "description": f"这是一个测试训练计划{i}",
            "workout_id": None,
            "target_ids": [target.id],
            "checklist": [
                {"name": f"测试检查项{i}", "is_optional": False}
            ],
            "note": f"测试备注{i}"
        }
        )
    
    # 3. 获取所有训练计划
    response = client.get("/api/lifting/routine?page=0&size=10")
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert "total" in data["data"]
    assert "items" in data["data"]
    assert len(data["data"]["items"]) >= 2


def test_add_exercise_to_routine(client, db):
    """测试向训练计划添加练习"""
    # 1. 先创建一块肌肉
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

    # 2. 创建一个练习
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

    # 3. 创建一个训练计划
    from app.services.target import TargetService

    # 添加测试目标
    target = TargetService.create(db, name="测试目标")
    
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
    
    # 4. 向训练计划添加练习
    response = client.post(
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



    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert data["data"]["exercise"]["id"] == exercise_id
