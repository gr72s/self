def test_create_muscle_success(client):
    """测试创建肌肉成功"""
    # 发送创建肌肉请求
    response = client.post(
        "/api/lifting/muscle",
        json={
            "name": "测试肌肉",
            "function": "测试功能",
            "origin_name": "测试起点"
        }
    )
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert data["data"]["name"] == "测试肌肉"


def test_update_muscle_success(client):
    """测试更新肌肉成功"""
    # 1. 先创建一块肌肉
    create_response = client.post(
        "/api/lifting/muscle",
        json={
            "name": "测试肌肉",
            "function": "测试功能",
            "origin_name": "测试起点"
        }
    )
    muscle_id = create_response.json()["data"]["id"]
    
    # 2. 更新肌肉
    update_response = client.put(
        f"/api/lifting/muscle/{muscle_id}",
        json={
            "name": "更新后的肌肉",
            "function": "更新后的测试功能",
            "origin_name": "更新后的测试起点"
        }
    )
    
    # 验证响应
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert data["data"]["name"] == "更新后的肌肉"


def test_get_all_muscles(client):
    """测试获取所有肌肉"""
    # 1. 创建两块肌肉
    for i in range(2):
        client.post(
            "/api/lifting/muscle",
            json={
                "name": f"测试肌肉{i}",
                "function": f"测试功能{i}",
                "origin_name": f"测试起点{i}"
            }
        )
    
    # 2. 获取所有肌肉
    response = client.get("/api/lifting/muscle")
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert "total" in data["data"]
    assert "items" in data["data"]
    assert len(data["data"]["items"]) >= 2


def test_get_muscle_by_id(client):
    """测试根据ID获取肌肉"""
    # 1. 先创建一块肌肉
    create_response = client.post(
        "/api/lifting/muscle",
        json={
            "name": "测试肌肉",
            "function": "测试功能",
            "origin_name": "测试起点"
        }
    )
    muscle_id = create_response.json()["data"]["id"]
    
    # 2. 根据ID获取肌肉
    get_response = client.get(f"/api/lifting/muscle/{muscle_id}")
    
    # 验证响应
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert data["data"]["id"] == muscle_id
    assert data["data"]["name"] == "测试肌肉"
