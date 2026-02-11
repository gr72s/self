import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.core.config import get_settings
from main import app

# 设置测试环境
os.environ["SELF_ENV"] = "testing"
# 清除缓存并获取设置
settings = get_settings()

# 创建测试数据库引擎
engine = create_engine(
    settings.DATABASE_URL,
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
        # 执行SQL文件作为测试数据
        import os
        from sqlalchemy import text
        sql_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        if os.path.exists(sql_dir):
            sql_files = [f for f in os.listdir(sql_dir) if f.endswith(".sql")]
            
            # 先执行user.sql，确保用户数据被正确加载
            user_sql_file = "user.sql"
            if user_sql_file in sql_files:
                sql_path = os.path.join(sql_dir, user_sql_file)
                try:
                    with open(sql_path, "r", encoding="utf-8") as f:
                        sql_content = f.read()
                        # 分割SQL语句并逐个执行
                        statements = sql_content.split(';')
                        for statement in statements:
                            statement = statement.strip()
                            if statement and not statement.startswith('--'):
                                db.execute(text(statement))
                    db.commit()
                except Exception as e:
                    print(f"执行SQL文件 {user_sql_file} 失败: {e}")
                    db.rollback()
            
            # 执行其他SQL文件
            for sql_file in sql_files:
                if sql_file != user_sql_file:
                    sql_path = os.path.join(sql_dir, sql_file)
                    try:
                        with open(sql_path, "r", encoding="utf-8") as f:
                            sql_content = f.read()
                            # 分割SQL语句并逐个执行
                            statements = sql_content.split(';')
                            for statement in statements:
                                statement = statement.strip()
                                if statement and not statement.startswith('--'):
                                    db.execute(text(statement))
                        db.commit()
                    except Exception as e:
                        print(f"执行SQL文件 {sql_file} 失败: {e}")
                        db.rollback()
        
        # 确保有一个测试用户
        from app.models import User
        from app.services.auth import AuthService
        if not db.query(User).first():
            # 创建测试用户
            user = AuthService.create_user(
                db,
                username="testuser",
                password="testpassword",
                nickname="Test User"
            )
            db.commit()
        
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
    """获取测试用户"""
    from app.models import User
    
    # 从数据库中获取第一个用户作为测试用户
    user = db.query(User).first()
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