import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.core.config import settings
from main import app

# 创建测试数据库引擎
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# 创建测试数据库会话
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """创建测试数据库会话"""
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    # 创建会话
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        # 关闭会话并删除所有表
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """创建测试客户端"""
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    # 替换依赖项
    app.dependency_overrides[get_db] = override_get_db
    
    # 创建测试客户端
    yield TestClient(app)
    
    # 恢复原始依赖项
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(db):
    """创建测试用户"""
    from app.services.auth import AuthService
    
    # 创建测试用户
    user = AuthService.create_user(
        db,
        username="testuser",
        password="testpassword",
        nickname="Test User"
    )
    
    return user


@pytest.fixture(scope="function")
def test_token(client, test_user):
    """获取测试用户的访问令牌"""
    # 登录获取令牌
    response = client.post(
        "/api/users/login",
        data={
            "username": "testuser",
            "password": "testpassword"
        }
    )
    
    assert response.status_code == 200
    return response.json()["access_token"]