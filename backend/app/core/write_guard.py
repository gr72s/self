from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.exceptions import DataWriteException


def _rollback_safely(db: Session) -> None:
    try:
        db.rollback()
    except Exception:
        # Keep the original write error as the primary signal.
        pass


def commit_create(db: Session, entity: object, pk_field: str = "id") -> None:
    try:
        db.flush()
        if getattr(entity, pk_field, None) is None:
            _rollback_safely(db)
            raise DataWriteException()

        db.commit()
        db.refresh(entity)
    except DataWriteException:
        raise
    except (SQLAlchemyError, Exception) as exc:
        _rollback_safely(db)
        raise DataWriteException() from exc


def commit_update(db: Session, entity: object) -> None:
    try:
        db.flush()
        db.commit()
        db.refresh(entity)
    except (SQLAlchemyError, Exception) as exc:
        _rollback_safely(db)
        raise DataWriteException() from exc


def commit_delete(db: Session) -> None:
    try:
        db.flush()
        db.commit()
    except (SQLAlchemyError, Exception) as exc:
        _rollback_safely(db)
        raise DataWriteException() from exc
