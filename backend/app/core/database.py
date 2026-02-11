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
    from app.models import User, Muscle, Target, Gym, Exercise
    from app.services.auth import AuthService
    from app.services.muscle import MuscleService
    from app.services.target import TargetService
    from app.services.gym import GymService
    from app.services.exercise import ExerciseService
    
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
        
        # 添加默认肌肉
        if not db.query(Muscle).first():
            default_muscles = [
                {"name": "胸肌", "description": "胸部肌肉", "function": "推挤动作", "origin_name": "胸骨"},
                {"name": "背肌", "description": "背部肌肉", "function": "拉动动作", "origin_name": "脊柱"},
                {"name": "手臂", "description": "手臂肌肉", "function": "弯曲和伸展", "origin_name": "肱骨"},
                {"name": "腿部", "description": "腿部肌肉", "function": "行走和跳跃", "origin_name": "骨盆"},
                {"name": "肩部", "description": "肩部肌肉", "function": "抬起和旋转", "origin_name": "肩胛骨"}
            ]
            for muscle_data in default_muscles:
                MuscleService.create(
                    db,
                    name=muscle_data["name"],
                    description=muscle_data["description"],
                    function=muscle_data["function"],
                    origin_name=muscle_data["origin_name"]
                )
        
        # 添加默认目标
        if not db.query(Target).first():
            default_targets = ["增肌", "减脂", "耐力", "力量", "灵活性"]
            for target_name in default_targets:
                TargetService.create(db, name=target_name)
        
        # 添加默认健身房
        if not db.query(Gym).first():
            default_gyms = [
                {"name": "健身中心", "location": "市中心"},
                {"name": "运动俱乐部", "location": "郊区"}
            ]
            for gym_data in default_gyms:
                GymService.create(
                    db,
                    name=gym_data["name"],
                    location=gym_data["location"]
                )
        
        # 添加默认练习
        if not db.query(Exercise).first():
            # 获取肌肉和目标
            chest_muscle = db.query(Muscle).filter(Muscle.name == "胸肌").first()
            back_muscle = db.query(Muscle).filter(Muscle.name == "背肌").first()
            
            if chest_muscle:
                ExerciseService.create(
                    db,
                    name="卧推",
                    description="胸部推挤练习",
                    main_muscle_ids={chest_muscle.id},
                    support_muscle_ids=set(),
                    cues=["保持核心稳定", "控制下降速度"]
                )
            
            if back_muscle:
                ExerciseService.create(
                    db,
                    name="引体向上",
                    description="背部拉动练习",
                    main_muscle_ids={back_muscle.id},
                    support_muscle_ids=set(),
                    cues=["保持身体挺直", "用背部发力"]
                )
        
        # 提交所有更改
        db.commit()
        print("数据库初始化完成，已添加种子数据")
        
    except Exception as e:
        print(f"数据库初始化失败：{e}")
        db.rollback()
    finally:
        db.close()
