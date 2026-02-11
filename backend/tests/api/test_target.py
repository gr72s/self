def test_get_all_targets(client):
    """测试获取所有目标"""
    # 1. 先通过API添加一些目标
    for i in range(3):
        response = client.post(
            "/api/lifting/target",
            json={
                "name": f"测试目标{i}"
            }
        )
        assert response.status_code == 200
    
    # 2. 获取所有目标
    response = client.get("/api/lifting/target?page=0&size=10")
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert "total" in data["data"]
    assert "items" in data["data"]
    assert data["data"]["total"] >= 3
    assert len(data["data"]["items"]) >= 3


def test_get_target_by_id(client):
    """测试根据ID获取目标"""
    # 1. 先通过API添加一个目标
    create_response = client.post(
        "/api/lifting/target",
        json={
            "name": "测试目标"
        }
    )
    assert create_response.status_code == 200
    target_id = create_response.json()["data"]["id"]
    
    # 2. 根据ID获取目标
    response = client.get(f"/api/lifting/target/{target_id}")
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["code"] == 200
    assert data["message"] == "success"
    assert "data" in data
    assert data["data"]["id"] == target_id
    assert data["data"]["name"] == "测试目标"
