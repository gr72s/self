import os
import json
import click
from app.core.logger import logger

@click.command()
@click.option('--boot-env', help='Environment to use (development, testing, production)')
@click.option('--project-path', help='Project directory path')
def init_project_command(boot_env, project_path):
    """Initialize the project directory structure"""
    click.echo("开始初始化项目目录结构...")
    
    try:
        # 获取用户主目录
        user_home = os.path.expanduser("~")
        # 定义.self目录路径
        self_dir = os.path.join(user_home, ".self")
        
        # 如果.self目录已存在，清空后重新创建
        if os.path.exists(self_dir):
            click.echo(f".self目录已存在，正在清空...")
            # 清空目录中的所有文件和子目录
            for root, dirs, files in os.walk(self_dir, topdown=False):
                for file in files:
                    file_path = os.path.join(root, file)
                    try:
                        os.remove(file_path)
                    except Exception as e:
                        click.echo(f"删除文件失败: {file_path}, 错误: {e}")
                        logger.warning(f"Failed to remove file: {file_path}, error: {e}")
                for dir in dirs:
                    dir_path = os.path.join(root, dir)
                    try:
                        os.rmdir(dir_path)
                    except Exception as e:
                        click.echo(f"删除目录失败: {dir_path}, 错误: {e}")
                        logger.warning(f"Failed to remove directory: {dir_path}, error: {e}")
            click.echo(f".self目录已清空")
        
        # 创建.self目录
        os.makedirs(self_dir, exist_ok=True)
        click.echo(f"创建.self目录: {self_dir}")
        
        # 创建logs目录
        logs_dir = os.path.join(self_dir, "logs")
        os.makedirs(logs_dir, exist_ok=True)
        click.echo(f"创建logs目录: {logs_dir}")
        
        # 创建空的日志文件
        log_file = os.path.join(logs_dir, "app.log")
        open(log_file, 'a').close()
        click.echo(f"创建日志文件: {log_file}")
        
        # 复制backend/config.json到~/.self文件夹中
        # 计算backend/config.json的路径
        # __file__ 是 /home/green/project/self/backend/cli/commands/init_project.py
        # 往上三级目录到backend目录
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        backend_config = os.path.join(backend_dir, "config.json")
        config_file = os.path.join(self_dir, "config.json")
        
        if os.path.exists(backend_config):
            # 读取backend/config.json文件
            with open(backend_config, 'r', encoding='utf-8') as f:
                config_data = json.load(f)
            
            # 应用命令行参数
            if boot_env:
                config_data["BOOT_ENV"] = boot_env
                click.echo(f"设置环境: {boot_env}")
            if project_path:
                config_data["PROJECT_PATH"] = project_path
                click.echo(f"设置项目路径: {project_path}")
            
            # 写入到~/.self/config.json
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(config_data, f, indent=2, ensure_ascii=False)
            
            # 同时更新backend/config.json文件
            with open(backend_config, 'w', encoding='utf-8') as f:
                json.dump(config_data, f, indent=2, ensure_ascii=False)
            
            click.echo(f"复制配置文件: {backend_config} -> {config_file}")
        else:
            # 如果backend/config.json不存在，创建默认配置
            config_data = {
                "APP_NAME": "Self API",
                "DEBUG": True,
                "BOOT_ENV": boot_env or "development",
                "PROJECT_PATH": project_path or "~/.self/",
                "DB_NAME": {
                    "default": "self.db",
                    "development": "self.dev.db",
                    "testing": "self.test.db",
                    "production": "self.db"
                },
                "SECRET_KEY": "7f3a9b2c8e1d4f6a5b9c8e7d1a3f4b6c8e9d2a5f7c1b3e8d4a6f9c2b5e8a1d4f7b",
                "ALGORITHM": "HS256",
                "ACCESS_TOKEN_EXPIRE_MINUTES": 10080
            }
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(config_data, f, indent=2, ensure_ascii=False)
            click.echo(f"创建默认配置文件: {config_file}")
        
        # 检查微信小程序配置文件
        click.echo("\n开始检查微信小程序配置文件...")
        
        # 获取WECHAT_APP_CONFIG目录
        wechat_config_dir = config_data.get("WECHAT_APP_CONFIG", "~/.self-app")
        wechat_config_dir = os.path.expanduser(wechat_config_dir)
        
        # 检查目录是否存在
        if not os.path.exists(wechat_config_dir):
            click.echo(f"微信小程序配置目录不存在: {wechat_config_dir}", err=True)
            logger.error(f"WeChat config directory does not exist: {wechat_config_dir}")
            raise Exception(f"微信小程序配置目录不存在: {wechat_config_dir}")
        
        # 检查appid文件是否存在
        appid_file = os.path.join(wechat_config_dir, "appid")
        if not os.path.exists(appid_file):
            click.echo(f"微信小程序appid文件不存在: {appid_file}", err=True)
            logger.error(f"WeChat appid file does not exist: {appid_file}")
            raise Exception(f"微信小程序appid文件不存在: {appid_file}")
        
        # 检查appsecret文件是否存在
        appsecret_file = os.path.join(wechat_config_dir, "appsecret")
        if not os.path.exists(appsecret_file):
            click.echo(f"微信小程序appsecret文件不存在: {appsecret_file}", err=True)
            logger.error(f"WeChat appsecret file does not exist: {appsecret_file}")
            raise Exception(f"微信小程序appsecret文件不存在: {appsecret_file}")
        
        # 检查文件是否为空
        if os.path.getsize(appid_file) == 0:
            click.echo(f"微信小程序appid文件为空: {appid_file}", err=True)
            logger.error(f"WeChat appid file is empty: {appid_file}")
            raise Exception(f"微信小程序appid文件为空: {appid_file}")
        
        if os.path.getsize(appsecret_file) == 0:
            click.echo(f"微信小程序appsecret文件为空: {appsecret_file}", err=True)
            logger.error(f"WeChat appsecret file is empty: {appsecret_file}")
            raise Exception(f"微信小程序appsecret文件为空: {appsecret_file}")
        
        # 复制文件到PROJECT_PATH目录
        project_path = config_data.get("PROJECT_PATH", "~/.self/")
        project_path = os.path.expanduser(project_path)
        
        # 确保目标目录存在
        os.makedirs(project_path, exist_ok=True)
        
        # 复制appid文件
        dest_appid_file = os.path.join(project_path, "appid")
        import shutil
        try:
            shutil.copy2(appid_file, dest_appid_file)
            click.echo(f"复制微信小程序appid文件: {appid_file} -> {dest_appid_file}")
            logger.info(f"Copied WeChat appid file: {appid_file} -> {dest_appid_file}")
        except Exception as e:
            click.echo(f"复制微信小程序appid文件失败: {e}", err=True)
            logger.error(f"Failed to copy WeChat appid file: {e}")
            raise
        
        # 复制appsecret文件
        dest_appsecret_file = os.path.join(project_path, "appsecret")
        try:
            shutil.copy2(appsecret_file, dest_appsecret_file)
            click.echo(f"复制微信小程序appsecret文件: {appsecret_file} -> {dest_appsecret_file}")
            logger.info(f"Copied WeChat appsecret file: {appsecret_file} -> {dest_appsecret_file}")
        except Exception as e:
            click.echo(f"复制微信小程序appsecret文件失败: {e}", err=True)
            logger.error(f"Failed to copy WeChat appsecret file: {e}")
            raise
        
        # 初始化数据库
        click.echo("\n开始初始化数据库结构...")
        
        # 清除settings缓存，确保使用最新的配置
        from app.core.config import get_settings
        get_settings.cache_clear()
        
        from app.core.config import settings
        from app.core.database import Base, engine, SessionLocal
        from sqlalchemy import text
        
        # 导入所有模型，确保Base.metadata包含所有表定义
        logger.info("Importing all database models...")
        try:
            from app.models import User, Muscle, Target, Gym, Exercise, Routine, Slot, Workout
            logger.info("Successfully imported all database models")
        except Exception as e:
            click.echo(f"导入模型失败: {e}", err=True)
            logger.error(f"Failed to import database models: {e}")
            raise
        
        # 根据环境执行不同的逻辑
        if settings.ENVIRONMENT != "production":
            # 开发和测试环境：创建表结构并导入数据
            click.echo("\n开始创建数据库表结构...")
            
            # 创建所有表
            logger.info("Creating all database tables using SQLAlchemy API...")
            try:
                # 使用SQLAlchemy的API创建所有表结构
                Base.metadata.create_all(bind=engine)
                click.echo("数据库表结构创建完成！")
                logger.info("Database tables created successfully using SQLAlchemy API")
            except Exception as e:
                click.echo(f"创建数据库表结构失败: {e}", err=True)
                logger.error(f"Failed to create database tables: {e}")
                raise
            
            # 导入种子数据
            click.echo("\n开始导入种子数据...")
            
            # 创建数据库会话
            db = SessionLocal()
            
            try:
                # 执行SQL文件
                sql_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
                if os.path.exists(sql_dir):
                    sql_files = [f for f in os.listdir(sql_dir) if f.endswith(".sql")]
                    for sql_file in sql_files:
                        sql_path = os.path.join(sql_dir, sql_file)
                        click.echo(f"执行SQL文件: {sql_file}")
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
                            click.echo(f"成功执行SQL文件: {sql_file}")
                            logger.info(f"Successfully executed SQL file: {sql_file}")
                        except Exception as e:
                            click.echo(f"执行SQL文件失败: {e}", err=True)
                            logger.error(f"Failed to execute SQL file {sql_file}: {e}")
                    
                    # 提交所有更改
                    db.commit()
                    click.echo("种子数据导入完成！")
                    logger.info("Database initialization completed with seed data")
                    
            except Exception as e:
                click.echo(f"数据库初始化失败: {e}", err=True)
                logger.error(f"Database initialization failed: {e}")
                db.rollback()
                raise
            finally:
                db.close()
        else:
            # 生产环境：只创建表结构，不导入数据
            click.echo("\n开始创建数据库表结构...")
            
            # 创建所有表
            logger.info("Creating all database tables using SQLAlchemy API...")
            try:
                # 使用SQLAlchemy的API创建所有表结构
                Base.metadata.create_all(bind=engine)
                click.echo("数据库表结构创建完成！")
                logger.info("Database tables created successfully using SQLAlchemy API")
            except Exception as e:
                click.echo(f"创建数据库表结构失败: {e}", err=True)
                logger.error(f"Failed to create database tables: {e}")
                raise
            
            click.echo("生产环境：只创建表结构，跳过数据导入")
            logger.info("Production environment: skipping data import, only created table structure using SQLAlchemy API")
        
        # 获取数据库文件路径
        db_url = settings.DATABASE_URL
        if db_url.startswith("sqlite:///"):
            db_path = db_url.replace("sqlite:///", "")
            click.echo(f"\n数据库文件位置: {db_path}")
        
        click.echo("数据库初始化完成！")
        
        # 打印成功信息
        click.echo("\n项目目录结构初始化完成！")
        click.echo(f"配置文件位置: {config_file}")
        click.echo(f"日志文件位置: {log_file}")
        click.echo(f"当前环境: {settings.ENVIRONMENT}")
        
        logger.info("项目目录结构初始化完成！")
        
    except Exception as e:
        # 打印错误信息
        click.echo(f"初始化失败: {e}", err=True)
        logger.error(f"初始化失败: {e}")
        raise

# 为了与命令名称匹配，使用init-project作为命令名
init_project_command.name = "init-project"