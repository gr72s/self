import json
import os
import subprocess
import click


REQUIRED_CONFIG_KEYS = [
    "APP_NAME",
    "DEBUG",
    "BOOT_ENV",
    "PROJECT_PATH",
    "WECHAT_APP_CONFIG",
    "DB_NAME",
    "SECRET_KEY",
    "ALGORITHM",
    "ACCESS_TOKEN_EXPIRE_MINUTES",
]

REQUIRED_DB_NAME_KEYS = ["default", "development", "testing", "production"]

REQUIRED_TABLES = {
    "user",
    "lifting_muscle",
    "lifting_target",
    "lifting_gym",
    "lifting_exercise",
    "lifting_routine",
    "lifting_slot",
    "lifting_workout",
    "lifting_main_muscle_exercise",
    "lifting_support_muscle_exercise",
    "lifting_routine_target",
    "lifting_workout_target",
}

VALID_BOOT_ENVS = {"development", "testing", "production"}


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise click.ClickException(message)


@click.command(name="check-project")
def check_project_command():
    """Validate initialized project files and sqlite schema."""
    user_home = os.path.expanduser("~")
    project_root = os.path.join(user_home, ".self")
    config_path = os.path.join(project_root, "config.json")

    click.echo("Checking project configuration...")
    _require(os.path.exists(config_path), f"Missing config file: {config_path}")

    try:
        with open(config_path, "r", encoding="utf-8") as f:
            config = json.load(f)
    except json.JSONDecodeError as exc:
        raise click.ClickException(f"Invalid JSON in {config_path}: {exc}") from exc

    missing_keys = [key for key in REQUIRED_CONFIG_KEYS if key not in config]
    _require(
        not missing_keys,
        f"Missing required config fields: {', '.join(missing_keys)}",
    )

    db_name = config["DB_NAME"]
    _require(isinstance(config["DEBUG"], bool), "config.DEBUG must be a boolean")
    _require(isinstance(config["PROJECT_PATH"], str) and config["PROJECT_PATH"].strip(), "config.PROJECT_PATH must be a non-empty string")
    _require(config["BOOT_ENV"] in VALID_BOOT_ENVS, f"config.BOOT_ENV must be one of: {', '.join(sorted(VALID_BOOT_ENVS))}")
    _require(isinstance(db_name, dict), "config.DB_NAME must be an object")

    missing_db_keys = [key for key in REQUIRED_DB_NAME_KEYS if key not in db_name]
    _require(
        not missing_db_keys,
        f"config.DB_NAME missing fields: {', '.join(missing_db_keys)}",
    )

    project_path = os.path.expanduser(config["PROJECT_PATH"])
    boot_env = config["BOOT_ENV"]
    expected_db_name = db_name[boot_env]
    _require(
        isinstance(expected_db_name, str) and expected_db_name.strip(),
        f"config.DB_NAME.{boot_env} must be a non-empty string",
    )

    click.echo("Checking project path and credential files...")
    _require(os.path.isdir(project_path), f"Missing project directory: {project_path}")

    appid_path = os.path.join(project_path, "appid")
    appsecret_path = os.path.join(project_path, "appsecret")
    _require(os.path.exists(appid_path), f"Missing appid file: {appid_path}")
    _require(os.path.exists(appsecret_path), f"Missing appsecret file: {appsecret_path}")
    _require(os.path.getsize(appid_path) > 0, f"appid file is empty: {appid_path}")
    _require(os.path.getsize(appsecret_path) > 0, f"appsecret file is empty: {appsecret_path}")

    click.echo("Checking database file...")
    db_path = os.path.join(project_path, expected_db_name)
    _require(os.path.exists(db_path), f"Missing database file: {db_path}")

    click.echo("Checking sqlite schema with sqlite3 .tables...")
    try:
        result = subprocess.run(
            ["sqlite3", db_path, ".tables"],
            capture_output=True,
            text=True,
            check=True,
        )
    except FileNotFoundError as exc:
        raise click.ClickException("sqlite3 command not found in current environment") from exc
    except subprocess.CalledProcessError as exc:
        raise click.ClickException(f"Failed to inspect sqlite tables: {exc.stderr.strip()}") from exc

    discovered_tables = set(result.stdout.split())
    missing_tables = sorted(REQUIRED_TABLES - discovered_tables)
    _require(
        not missing_tables,
        f"Database schema incomplete. Missing tables: {', '.join(missing_tables)}",
    )

    click.echo("Project check passed.")
