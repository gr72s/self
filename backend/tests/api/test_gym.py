def test_create_gym_success(client):
    """测试创建健身房成功"""
    # 发送创建健身房请求
    response = client.post(
        "/api/lifting/gym",
        json={
            "name": "测试健身房",
            "location": "测试位置"
        }
    )
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert data["data"]["name"] == "测试健身房"
    assert data["data"]["location"] == "测试位置"


def test_update_gym_success(client):
    """测试更新健身房成功"""
    # 1. 先创建一个健身房
    create_response = client.post(
        "/api/lifting/gym",
        json={
            "name": "测试健身房",
            "location": "测试位置"
        }
    )
    gym_id = create_response.json()["data"]["id"]
    
    # 2. 更新健身房
    update_response = client.put(
        f"/api/lifting/gym/{gym_id}",
        json={
            "name": "更新后的健身房",
            "location": "更新后的测试位置"
        }
    )
    
    # 验证响应
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert data["data"]["name"] == "更新后的健身房"
    assert data["data"]["location"] == "更新后的测试位置"


def test_get_all_gyms(client):
    """测试获取所有健身房"""
    # 1. 创建两个健身房
    for i in range(2):
        client.post(
            "/api/lifting/gym",
            json={
                "name": f"测试健身房{i}",
                "location": f"测试位置{i}"
            }
        )
    
    # 2. 获取所有健身房
    response = client.get("/api/lifting/gym?page=0&size=10")
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert "total" in data["data"]
    assert "items" in data["data"]
    assert len(data["data"]["items"]) >= 2


def test_get_gym_by_id(client):
    """测试根据ID获取健身房"""
    # 1. 先创建一个健身房
    create_response = client.post(
        "/api/lifting/gym",
        json={
            "name": "测试健身房",
            "location": "测试位置"
        }
    )
    gym_id = create_response.json()["data"]["id"]
    
    # 2. 根据ID获取健身房
    get_response = client.get(f"/api/lifting/gym/{gym_id}")
    
    # 验证响应
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert data["data"]["id"] == gym_id
    assert data["data"]["name"] == "测试健身房"
    assert data["data"]["location"] == "测试位置"
