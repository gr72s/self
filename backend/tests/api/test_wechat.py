def test_wechat_login(client, monkeypatch):
    """测试微信登录"""
    # 1. 模拟WeChatService的方法
    class MockTokenResponse:
        def __init__(self):
            self.access_token = "mock_access_token"
            self.openid = "mock_openid"
    
    class MockUserInfo:
        def __init__(self):
            self.openid = "mock_openid"
            self.unionid = "mock_unionid"
            self.nickname = "Mock User"
            self.headimgurl = "http://example.com/avatar.jpg"
    
    async def mock_get_access_token(code):
        return MockTokenResponse()
    
    async def mock_get_user_info(access_token, openid):
        return MockUserInfo()
    
    # 2. 应用模拟
    monkeypatch.setattr(
        "app.services.wechat.WeChatService.get_access_token",
        mock_get_access_token
    )
    monkeypatch.setattr(
        "app.services.wechat.WeChatService.get_user_info",
        mock_get_user_info
    )
    
    # 3. 发送微信登录请求
    response = client.post(
        "/api/auth/wechat",
        json={
            "code": "mock_code"
        }
    )
    
    # 验证响应
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["nickname"] == "Mock User"
