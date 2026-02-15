from __future__ import annotations

import os
from typing import Callable

from sqlalchemy import text

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


def _run_seed_sql(sql_dir: str, emit: Emitter) -> None:
    from app.core.database import SessionLocal

    db = SessionLocal()
    try:
        if not os.path.exists(sql_dir):
            return

        sql_files = sorted(f for f in os.listdir(sql_dir) if f.endswith(".sql"))
        for sql_file in sql_files:
            sql_path = os.path.join(sql_dir, sql_file)
            emit(f"Executing SQL file: {sql_file}")
            logger.info("Executing SQL file: %s", sql_file)
            with open(sql_path, "r", encoding="utf-8") as f:
                sql_content = f.read()
            for statement in sql_content.split(";"):
                statement = statement.strip()
                if statement and not statement.startswith("--"):
                    db.execute(text(statement))
        db.commit()
        emit("Seed data import completed.")
        logger.info("Database seed data import completed")
    except Exception:
        db.rollback()
        logger.exception("Database seed data import failed")
        raise
    finally:
        db.close()


def initialize_database(environment: str, emit: Emitter = print) -> str:
    """Create schema and optionally import seed data. Returns database URL."""
    from app.core.config import settings
    from app.core.database import Base, engine

    emit("Initializing database...")
    logger.info("Initializing database for environment: %s", environment)

    _import_models()
    Base.metadata.create_all(bind=engine)
    emit("Database schema created.")
    logger.info("Database schema created")

    if environment != "production":
        data_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "data")
        )
        _run_seed_sql(data_dir, emit)
    else:
        emit("Production mode: schema only, skip seed import.")
        logger.info("Production mode: skipped seed import")

    return settings.DATABASE_URL

