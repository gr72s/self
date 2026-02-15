import click

from app.runtime.uninstall import uninstall_self_packages


@click.command(name="uninstall-self")
def uninstall_self_command():
    """Uninstall installed self-api package(s) from current Python environment."""
    try:
        removed = uninstall_self_packages()
        if not removed:
            click.echo("No self-api package found.")
            return
        click.echo(f"Removed packages: {', '.join(removed)}")
    except Exception as exc:
        raise click.ClickException(str(exc))

