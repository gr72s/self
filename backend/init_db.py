"""数据库初始化脚本"""
from app.core.logger import logger

if __name__ == "__main__":
    logger.info("开始初始化数据库...")
    
    # 建议使用 self init-db 命令
    logger.info("请注意：此脚本已废弃，请使用 'self init-db' 命令来初始化数据库")
    print("请注意：此脚本已废弃，请使用 'self init-db' 命令来初始化数据库")
    
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
        print("数据库表结构创建完成！")
        logger.info("Database tables created successfully")
        
        # 根据环境执行不同的逻辑
        if settings.ENVIRONMENT != "production":
            # 开发和测试环境：执行SQL文件导入数据
            print("\n开始导入种子数据...")
            
            # 创建数据库会话
            db = SessionLocal()
            
            try:
                # 执行SQL文件
                sql_dir = os.path.join(os.path.dirname(__file__), "data")
                if os.path.exists(sql_dir):
                    sql_files = [f for f in os.listdir(sql_dir) if f.endswith(".sql")]
                    for sql_file in sql_files:
                        sql_path = os.path.join(sql_dir, sql_file)
                        print(f"执行SQL文件: {sql_file}")
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
                            print(f"成功执行SQL文件: {sql_file}")
                            logger.info(f"Successfully executed SQL file: {sql_file}")
                        except Exception as e:
                            print(f"执行SQL文件失败: {e}")
                            logger.error(f"Failed to execute SQL file {sql_file}: {e}")
                    
                    # 提交所有更改
                    db.commit()
                    print("种子数据导入完成！")
                    logger.info("Database initialization completed")
                    
            except Exception as e:
                print(f"数据库初始化失败: {e}")
                logger.error(f"Database initialization failed: {e}")
                db.rollback()
            finally:
                db.close()
        else:
            # 生产环境：只创建表结构，不导入数据
            print("生产环境：只创建表结构，跳过数据导入")
            logger.info("Production environment: skipping data import, only created table structure")
        
        print("数据库初始化完成！")
        logger.info("数据库初始化完成！")
        
    except Exception as e:
        print(f"数据库初始化失败: {e}")
        logger.error(f"数据库初始化失败: {e}")
