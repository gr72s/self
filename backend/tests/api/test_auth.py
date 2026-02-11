def test_login_success(client, test_user):
    """测试登录成功"""
    # 发送登录请求
    response = client.post(
        "/api/users/login",
        data={
            "username": "testuser",
            "password": "testpassword"
        }
    )
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["username"] == "testuser"


def test_login_failure(client):
    """测试登录失败"""
    # 发送登录请求，使用错误的密码
    response = client.post(
        "/api/users/login",
        data={
            "username": "testuser",
            "password": "wrongpassword"
        }
    )
    
    # 验证响应
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Incorrect username or password"


def test_get_current_user_success(client, test_token):
    """测试获取当前用户信息成功"""
    # 发送请求，携带有效的令牌
    response = client.get(
        "/api/users/current",
        headers={
            "Authorization": f"Bearer {test_token}"
        }
    )
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["nickname"] == "Test User"


def test_get_current_user_failure(client):
    """测试获取当前用户信息失败"""
    # 发送请求，携带无效的令牌
    response = client.get(
        "/api/users/current",
        headers={
            "Authorization": "Bearer invalidtoken"
        }
    )
    
    # 验证响应
    assert response.status_code == 401
    data = response.json()
    assert data["detail"] == "Could not validate credentials"
