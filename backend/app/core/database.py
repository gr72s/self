from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# 创建数据库引擎
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite需要此参数
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
Base = declarative_base()


# 依赖项：获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """初始化数据库并添加种子数据"""
    from app.models import User, Muscle, Target, Gym, Exercise, Routine, Slot, Workout
    from app.services.auth import AuthService
    from app.services.muscle import MuscleService
    from app.services.target import TargetService
    from app.services.gym import GymService
    from app.services.exercise import ExerciseService
    import os
    from sqlalchemy import text
    
    # 创建所有表
    Base.metadata.create_all(bind=engine)
    
    # 创建会话
    db = SessionLocal()
    
    try:
        # 添加默认用户
        if not db.query(User).first():
            # 使用简短的密码
            AuthService.create_user(
                db,
                username="admin",
                password="admin",
                nickname="Admin"
            )
        
        # 执行SQL文件
        sql_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
        if os.path.exists(sql_dir):
            sql_files = [f for f in os.listdir(sql_dir) if f.endswith(".sql")]
            for sql_file in sql_files:
                sql_path = os.path.join(sql_dir, sql_file)
                print(f"执行SQL文件: {sql_file}")
                try:
                    with open(sql_path, "r", encoding="utf-8") as f:
                        sql_content = f.read()
                        # 分割SQL语句并逐个执行
                        statements = sql_content.split(';')
                        for statement in statements:
                            statement = statement.strip()
                            if statement and not statement.startswith('--'):
                                db.execute(text(statement))
                    print(f"成功执行SQL文件: {sql_file}")
                except Exception as e:
                    print(f"执行SQL文件 {sql_file} 失败: {e}")
        
        # 提交所有更改
        db.commit()
        print("数据库初始化完成，已添加种子数据")
        
    except Exception as e:
        print(f"数据库初始化失败：{e}")
        db.rollback()
    finally:
        db.close()
