import subprocess
import click

@click.command()
def stop():
    """Stop the Self API application"""
    click.echo("Stopping Self API application...")
    
    # 查找并停止uvicorn进程
    try:
        # 使用ps命令查找uvicorn进程
        result = subprocess.run(
            ["ps", "aux"],
            capture_output=True,
            text=True
        )
        
        # 解析进程列表
        for line in result.stdout.splitlines():
            if "uvicorn" in line and "main:app" in line:
                # 提取进程ID
                parts = line.split()
                pid = parts[1]
                
                # 停止进程
                subprocess.run(["kill", pid], check=True)
                click.echo(f"Successfully stopped application with PID: {pid}")
                return
        
        click.echo("No running Self API application found")
        
    except subprocess.CalledProcessError as e:
        click.echo(f"Failed to stop application: {e}", err=True)
    except Exception as e:
        click.echo(f"Error: {e}", err=True)