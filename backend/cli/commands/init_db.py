import click
from app.core.database import init_db
from app.core.logger import logger

@click.command()
def init_db_command():
    """Initialize the database"""
    click.echo("开始初始化数据库...")
    
    try:
        # 调用数据库初始化函数
        init_db()
        
        # 打印成功信息
        click.echo("数据库初始化完成！")
        logger.info("数据库初始化完成！")
        
    except Exception as e:
        # 打印错误信息
        click.echo(f"数据库初始化失败: {e}", err=True)
        logger.error(f"数据库初始化失败: {e}")

# 为了与命令名称匹配，使用init-db作为命令名
init_db_command.name = "init-db"