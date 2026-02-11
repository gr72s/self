def test_create_exercise_success(client):
    """测试创建练习成功"""
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
    
    # 2. 创建练习
    response = client.post(
        "/api/lifting/exercise",
        json={
            "name": "测试练习",
            "description": "这是一个测试练习",
            "main_muscles": [muscle_id],
            "support_muscles": [],
            "cues": ["测试提示1", "测试提示2"]
        }
    )
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert data["data"]["name"] == "测试练习"


def test_get_all_exercises(client):
    """测试获取所有练习"""
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
    
    # 2. 创建两个练习
    for i in range(2):
        client.post(
            "/api/lifting/exercise",
            json={
            "name": f"测试练习{i}",
            "description": f"这是一个测试练习{i}",
            "main_muscles": [muscle_id],
            "support_muscles": [],
            "cues": [f"测试提示1-{i}", f"测试提示2-{i}"]
        }
        )
    
    # 3. 获取所有练习
    response = client.get("/api/lifting/exercise?page=0&size=10")
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert "total" in data["data"]
    assert "items" in data["data"]
    assert len(data["data"]["items"]) >= 2


def test_get_exercise_by_id(client):
    """测试根据ID获取练习"""
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
    
    # 2. 创建练习
    create_response = client.post(
        "/api/lifting/exercise",
        json={
            "name": "测试练习",
            "description": "这是一个测试练习",
            "main_muscles": [muscle_id],
            "support_muscles": [],
            "cues": ["测试提示1", "测试提示2"]
        }
    )
    exercise_id = create_response.json()["data"]["id"]
    
    # 3. 根据ID获取练习
    get_response = client.get(f"/api/lifting/exercise/{exercise_id}")
    
    # 验证响应
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert data["data"]["id"] == exercise_id
    assert data["data"]["name"] == "测试练习"
