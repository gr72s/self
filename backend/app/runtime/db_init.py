from __future__ import annotations

from typing import Callable

from app.core.logger import logger


Emitter = Callable[[str], None]


def _import_models() -> None:
    # Ensure Base.metadata contains all table definitions.
    from app.models import (  # noqa: F401
        Exercise,
        Gym,
        Muscle,
        Routine,
        Slot,
        Target,
        User,
        Workout,
    )


def initialize_database(environment: str, emit: Emitter = print) -> str:
    """Create schema only and return database URL."""
    from app.core.config import settings
    from app.core.database import Base, engine

    emit("Initializing database...")
    logger.info("Initializing database for environment: %s", environment)

    _import_models()
    Base.metadata.create_all(bind=engine)
    emit("Database schema created.")
    logger.info("Database schema created")

    emit("Schema-only initialization: seed import is disabled.")
    logger.info("Schema-only initialization completed for environment: %s", environment)

    return settings.DATABASE_URL
