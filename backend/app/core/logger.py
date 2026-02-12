import os
import logging
from logging.handlers import TimedRotatingFileHandler
from app.core.config import settings


def setup_logger():
    """设置日志配置"""
    # 获取日志目录
    user_home = os.path.expanduser("~")
    log_dir = os.path.join(user_home, ".self", "logs")
    os.makedirs(log_dir, exist_ok=True)
    
    # 创建日志记录器
    logger = logging.getLogger("self-api")
    logger.setLevel(logging.INFO)
    
    # 清除已有的处理器
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # 创建按日期轮转的文件处理器
    log_file = os.path.join(log_dir, "self-api.log")
    file_handler = TimedRotatingFileHandler(
        log_file,
        when="midnight",
        interval=1,
        backupCount=30,
        encoding="utf-8"
    )
    file_handler.suffix = "%Y%m%d"
    file_handler.setLevel(logging.INFO)
    
    # 创建控制台处理器
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # 设置日志格式
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # 添加处理器
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger


# 创建全局日志记录器
logger = setup_logger()
