import click

from app.runtime.server import get_server_config, run_server


@click.command()
def start():
    """Start the Self API application."""
    cfg = get_server_config()
    click.echo("Starting Self API application...")
    click.echo(f"Server config: host={cfg.host}, port={cfg.port}, reload={cfg.reload}")
    run_server()
