import json
import logging
import os
from logging.handlers import TimedRotatingFileHandler


def _resolve_log_level() -> int:
    """Resolve log level from backend/config.json DEBUG flag, defaulting to INFO."""
    backend_config = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "config.json")
    )

    try:
        with open(backend_config, "r", encoding="utf-8") as f:
            config = json.load(f)
        return logging.DEBUG if config.get("DEBUG") is True else logging.INFO
    except Exception:
        return logging.INFO


def setup_logger():
    """Configure application logger."""
    log_dir = os.path.join(os.path.expanduser("~"), ".self", "logs")
    os.makedirs(log_dir, exist_ok=True)

    logger = logging.getLogger("self-api")
    logger.setLevel(_resolve_log_level())
    logger.propagate = False

    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
        handler.close()

    log_file = os.path.join(log_dir, "self-api.log")
    file_handler = TimedRotatingFileHandler(
        log_file,
        when="midnight",
        interval=1,
        backupCount=30,
        encoding="utf-8",
    )
    file_handler.suffix = "%Y%m%d"
    file_handler.setLevel(logger.level)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logger.level)

    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger


logger = setup_logger()
