import subprocess
import click

@click.command()
def start():
    """Start the Self API application"""
    click.echo("Starting Self API application...")
    
    # 启动FastAPI应用
    try:
        # 使用uvicorn启动应用
        process = subprocess.Popen(
            ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
            cwd="/home/green/project/self/backend",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # 打印启动信息
        click.echo("Self API application started successfully!")
        click.echo("Access the application at http://localhost:8000")
        click.echo("Press Ctrl+C to stop the application")
        
        # 等待进程结束
        stdout, stderr = process.communicate()
        
        if stderr:
            click.echo(f"Error: {stderr}", err=True)
        
    except Exception as e:
        click.echo(f"Failed to start application: {e}", err=True)