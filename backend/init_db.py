"""数据库初始化脚本"""
from app.core.database import init_db
from app.core.logger import logger

if __name__ == "__main__":
    logger.info("开始初始化数据库...")
    init_db()
    logger.info("数据库初始化完成！")
