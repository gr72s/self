import subprocess
import click
import os

@click.command()
def start():
    """Start the Self API application"""
    click.echo("Starting Self API application...")
    
    # 获取当前文件所在目录，然后向上两级到backend目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(os.path.dirname(current_dir))
    
    # 启动FastAPI应用
    try:
        # 使用uvicorn启动应用
        process = subprocess.Popen(
            ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # 打印启动信息
        click.echo("Self API application started successfully!")
        click.echo(f"Working directory: {backend_dir}")
        click.echo("Access the application at http://localhost:8000")
        click.echo("Press Ctrl+C to stop the application")
        
        # 等待进程结束
        stdout, stderr = process.communicate()
        
        if stderr:
            click.echo(f"Error: {stderr}", err=True)
        
    except Exception as e:
        click.echo(f"Failed to start application: {e}", err=True)