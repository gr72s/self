from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, exercise, gym, muscle, routine, slot, target, workout
from app.core.config import settings
from app.core.database import engine, Base
from app.core.exceptions import global_exception_handler
from app.core.logger import logger

# 创建数据库表
logger.info("Creating database tables...")
Base.metadata.create_all(bind=engine)
logger.info("Database tables created successfully")

# 创建FastAPI应用实例
app = FastAPI(
    title="Self API",
    description="Self Training API",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册全局异常处理器
app.exception_handler(Exception)(global_exception_handler)

# 注册路由
logger.info("Registering routes...")
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(exercise.router, prefix="/api/lifting/exercise", tags=["exercise"])
app.include_router(gym.router, prefix="/api/lifting/gym", tags=["gym"])
app.include_router(muscle.router, prefix="/api/lifting/muscle", tags=["muscle"])
app.include_router(routine.router, prefix="/api/lifting/routine", tags=["routine"])
app.include_router(slot.router, prefix="/api/lifting/slot", tags=["slot"])
app.include_router(target.router, prefix="/api/lifting/target", tags=["target"])
app.include_router(workout.router, prefix="/api/lifting/workout", tags=["workout"])
logger.info("Routes registered successfully")

# 根路径
@app.get("/")
def read_root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to Self API"}

# 健康检查
@app.get("/health")
def health_check():
    logger.info("Health check endpoint accessed")
    return {"status": "healthy"}

# 应用启动事件
@app.on_event("startup")
async def startup_event():
    logger.info("Self API application starting up...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Database URL: {settings.DATABASE_URL}")

# 应用关闭事件
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Self API application shutting down...")

