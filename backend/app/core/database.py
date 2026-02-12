from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
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
    from app.core.logger import logger
    import os
    
    # 检查是否为production环境且数据库文件已存在
    if settings.ENVIRONMENT == "production":
        # 获取数据库文件路径
        db_url = settings.DATABASE_URL
        if db_url.startswith("sqlite:///"):
            db_path = db_url.replace("sqlite:///", "")
            if os.path.exists(db_path):
                logger.info(f"Production database already exists at {db_path}, skipping initialization")
                return
    
    # 清理开发环境数据库文件
    settings.cleanup_development_db()
    
    from app.models import User, Muscle, Target, Gym, Exercise, Routine, Slot, Workout
    from app.services.auth import AuthService
    from app.services.muscle import MuscleService
    from app.services.target import TargetService
    from app.services.gym import GymService
    from app.services.exercise import ExerciseService
    from sqlalchemy import text
    
    # 创建所有表
    logger.info("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
    
    # 创建会话
    db = SessionLocal()
    
    try:
        # 在非production环境下执行SQL文件
        if settings.ENVIRONMENT != "production":
            # 执行SQL文件
            sql_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
            if os.path.exists(sql_dir):
                sql_files = [f for f in os.listdir(sql_dir) if f.endswith(".sql")]
                for sql_file in sql_files:
                    sql_path = os.path.join(sql_dir, sql_file)
                    logger.info(f"Executing SQL file: {sql_file}")
                    try:
                        with open(sql_path, "r", encoding="utf-8") as f:
                            sql_content = f.read()
                            # 分割SQL语句并逐个执行
                            statements = sql_content.split(';')
                            for statement in statements:
                                statement = statement.strip()
                                if statement and not statement.startswith('--'):
                                    db.execute(text(statement))
                        logger.info(f"Successfully executed SQL file: {sql_file}")
                    except Exception as e:
                        logger.error(f"Failed to execute SQL file {sql_file}: {e}")
        
        # 提交所有更改
        db.commit()
        logger.info("Database initialization completed")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        db.rollback()
    finally:
        db.close()
