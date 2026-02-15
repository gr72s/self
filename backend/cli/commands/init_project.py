import json
import os
import shutil

import click

from app.core.logger import logger
from app.runtime.db_init import initialize_database


DEFAULT_CONFIG = {
    "APP_NAME": "Self API",
    "DEBUG": True,
    "BOOT_ENV": "development",
    "PROJECT_PATH": "~/.self/",
    "WECHAT_APP_CONFIG": "~/.self-app",
    "DB_NAME": {
        "default": "self.db",
        "development": "self.dev.db",
        "testing": "self.test.db",
        "production": "self.db",
    },
    "SECRET_KEY": "7f3a9b2c8e1d4f6a5b9c8e7d1a3f4b6c8e9d2a5f7c1b3e8d4a6f9c2b5e8a1d4f7b",
    "ALGORITHM": "HS256",
    "ACCESS_TOKEN_EXPIRE_MINUTES": 10080,
}


def _clear_directory(path: str) -> None:
    if not os.path.exists(path):
        return

    for root, dirs, files in os.walk(path, topdown=False):
        for file_name in files:
            os.remove(os.path.join(root, file_name))
        for dir_name in dirs:
            os.rmdir(os.path.join(root, dir_name))


def _ensure_non_empty_file(path: str, display_name: str) -> None:
    if not os.path.exists(path):
        raise click.ClickException(f"Missing {display_name} file: {path}")
    if os.path.getsize(path) == 0:
        raise click.ClickException(f"{display_name} file is empty: {path}")


@click.command(name="init-project")
@click.option("--boot-env", help="Environment to use (development, testing, production)")
@click.option("--project-path", help="Project directory path")
def init_project_command(boot_env, project_path):
    """Initialize project structure, copy config/secrets, and initialize database."""
    click.echo("Initializing project structure...")

    user_home = os.path.expanduser("~")
    self_dir = os.path.join(user_home, ".self")
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    backend_config_path = os.path.join(backend_dir, "config.json")
    config_file = os.path.join(self_dir, "config.json")

    try:
        if os.path.exists(self_dir):
            click.echo("Cleaning existing .self directory...")
            _clear_directory(self_dir)

        logs_dir = os.path.join(self_dir, "logs")
        os.makedirs(logs_dir, exist_ok=True)
        log_file = os.path.join(logs_dir, "app.log")
        open(log_file, "a", encoding="utf-8").close()

        if os.path.exists(backend_config_path):
            with open(backend_config_path, "r", encoding="utf-8") as f:
                config_data = json.load(f)
        else:
            config_data = dict(DEFAULT_CONFIG)

        if boot_env:
            config_data["BOOT_ENV"] = boot_env
        if project_path:
            config_data["PROJECT_PATH"] = project_path

        with open(config_file, "w", encoding="utf-8") as f:
            json.dump(config_data, f, indent=2, ensure_ascii=False)

        with open(backend_config_path, "w", encoding="utf-8") as f:
            json.dump(config_data, f, indent=2, ensure_ascii=False)

        click.echo(f"Config file written: {config_file}")

        wechat_config_dir = os.path.expanduser(config_data["WECHAT_APP_CONFIG"])
        appid_file = os.path.join(wechat_config_dir, "appid")
        appsecret_file = os.path.join(wechat_config_dir, "appsecret")

        if not os.path.isdir(wechat_config_dir):
            raise click.ClickException(f"Missing WeChat config directory: {wechat_config_dir}")
        _ensure_non_empty_file(appid_file, "appid")
        _ensure_non_empty_file(appsecret_file, "appsecret")

        project_root = os.path.expanduser(config_data["PROJECT_PATH"])
        os.makedirs(project_root, exist_ok=True)

        dst_appid = os.path.join(project_root, "appid")
        dst_appsecret = os.path.join(project_root, "appsecret")
        shutil.copy2(appid_file, dst_appid)
        shutil.copy2(appsecret_file, dst_appsecret)

        click.echo(f"Copied appid to: {dst_appid}")
        click.echo(f"Copied appsecret to: {dst_appsecret}")

        from app.core.config import get_settings

        get_settings.cache_clear()

        from app.core.config import settings

        db_url = initialize_database(settings.ENVIRONMENT, emit=click.echo)
        if db_url.startswith("sqlite:///"):
            click.echo(f"Database file: {db_url.replace('sqlite:///', '')}")

        click.echo("Project initialization completed.")
        click.echo(f"Log file: {log_file}")
        click.echo(f"Environment: {settings.ENVIRONMENT}")
    except Exception as exc:
        logger.exception("Project initialization failed")
        if isinstance(exc, click.ClickException):
            raise
        raise click.ClickException(str(exc))
