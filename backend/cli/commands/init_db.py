import click
from app.core.logger import logger

@click.command()
def init_db_command():
    """Initialize the database"""
    click.echo("开始初始化数据库...")
    
    try:
        from app.core.config import settings
        from app.core.database import Base, engine, SessionLocal
        from sqlalchemy import text
        import os
        
        # 导入所有模型，确保Base.metadata包含所有表定义
        from app.models import User, Muscle, Target, Gym, Exercise, Routine, Slot, Workout
        
        # 创建所有表
        logger.info("Creating all database tables...")
        Base.metadata.create_all(bind=engine)
        click.echo("数据库表结构创建完成！")
        logger.info("Database tables created successfully")
        
        # 根据环境执行不同的逻辑
        if settings.ENVIRONMENT != "production":
            # 开发和测试环境：执行SQL文件导入数据
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
                    logger.info("Database initialization completed")
                    
            except Exception as e:
                click.echo(f"数据库初始化失败: {e}", err=True)
                logger.error(f"Database initialization failed: {e}")
                db.rollback()
            finally:
                db.close()
        else:
            # 生产环境：只创建表结构，不导入数据
            click.echo("生产环境：只创建表结构，跳过数据导入")
            logger.info("Production environment: skipping data import, only created table structure")
        
        # 打印成功信息
        click.echo("数据库初始化完成！")
        logger.info("数据库初始化完成！")
        
    except Exception as e:
        # 打印错误信息
        click.echo(f"数据库初始化失败: {e}", err=True)
        logger.error(f"数据库初始化失败: {e}")

# 为了与命令名称匹配，使用init-db作为命令名
init_db_command.name = "init-db"