import subprocess
import click

@click.command(context_settings={"ignore_unknown_options": True})
@click.argument('args', nargs=-1)
def run(args):
    """Run a custom command"""
    if not args:
        click.echo("Please provide a command to run", err=True)
        return
    
    click.echo(f"Running command: {' '.join(args)}")
    
    try:
        # 执行命令
        result = subprocess.run(
            args,
            cwd="/home/green/project/self/backend",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=True
        )
        
        # 打印命令输出
        if result.stdout:
            click.echo(result.stdout)
        
        click.echo("Command executed successfully!")
        
    except subprocess.CalledProcessError as e:
        click.echo(f"Command failed with exit code {e.returncode}", err=True)
        if e.stdout:
            click.echo(e.stdout, err=True)
        if e.stderr:
            click.echo(e.stderr, err=True)
    except Exception as e:
        click.echo(f"Error running command: {e}", err=True)