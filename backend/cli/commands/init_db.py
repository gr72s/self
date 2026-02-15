import click

from app.core.config import settings
from app.core.logger import logger
from app.runtime.db_init import initialize_database


@click.command(name="init-db")
def init_db_command():
    """Initialize the database."""
    click.echo("Initializing database...")
    try:
        db_url = initialize_database(settings.ENVIRONMENT, emit=click.echo)
        if db_url.startswith("sqlite:///"):
            click.echo(f"Database file: {db_url.replace('sqlite:///', '')}")
        click.echo("Database initialization completed.")
    except Exception as exc:
        logger.exception("Database initialization failed")
        raise click.ClickException(str(exc))
