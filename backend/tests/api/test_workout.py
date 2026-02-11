def test_create_workout_success(client, db):
    """测试创建训练成功"""
    # 1. 先创建必要的资源
    # 创建健身房
    gym_response = client.post(
        "/api/lifting/gym",
        json={
            "name": "测试健身房",
            "location": "测试位置"
        }
    )
    gym_id = gym_response.json()["data"]["id"]

    # 创建目标
    from app.services.target import TargetService

    # 添加测试目标
    target = TargetService.create(db, name="测试目标")
    
    # 2. 创建训练
    import datetime
    current_time = datetime.datetime.now().isoformat()
    
    response = client.post(
        "/api/lifting/workout",
        json={
            "start_time": current_time,
            "end_time": None,
            "gym": gym_id,
            "routine": None,
            "target": [target.id],
            "note": "测试备注"
        }
    )
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert data["data"]["gym"]["id"] == gym_id


def test_get_all_workouts(client, db):
    """测试获取所有训练"""
    # 1. 先创建必要的资源
    # 创建健身房
    gym_response = client.post(
        "/api/lifting/gym",
        json={
            "name": "测试健身房",
            "location": "测试位置"
        }
    )
    gym_id = gym_response.json()["data"]["id"]

    # 创建目标
    from app.services.target import TargetService

    # 添加测试目标
    target = TargetService.create(db, name="测试目标")
    
    # 2. 创建两个训练
    import datetime
    current_time = datetime.datetime.now().isoformat()
    
    for i in range(2):
        client.post(
            "/api/lifting/workout",
            json={
            "start_time": current_time,
            "end_time": None,
            "gym": gym_id,
            "routine": None,
            "target": [target.id],
            "note": f"测试备注{i}"
        }
        )
    
    # 3. 获取所有训练
    response = client.get("/api/lifting/workout?page=0&size=10")
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert "total" in data["data"]
    assert "items" in data["data"]
    assert len(data["data"]["items"]) >= 2


def test_find_in_process_workout(client, db):
    """测试查找进行中的训练"""
    # 1. 先创建必要的资源
    # 创建健身房
    gym_response = client.post(
        "/api/lifting/gym",
        json={
            "name": "测试健身房",
            "location": "测试位置"
        }
    )
    gym_id = gym_response.json()["data"]["id"]

    # 创建目标
    from app.services.target import TargetService

    # 添加测试目标
    target = TargetService.create(db, name="测试目标")
    
    # 2. 创建一个未结束的训练
    import datetime
    current_time = datetime.datetime.now().isoformat()
    
    client.post(
        "/api/lifting/workout",
        json={
            "start_time": current_time,
            "end_time": None,  # 未结束的训练
            "gym": gym_id,
            "routine": None,
            "target": [target.id],
            "note": "测试备注"
        }
    )
    
    # 3. 查找进行中的训练
    response = client.get("/api/lifting/workout/in-process")
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert data["data"] is not None
