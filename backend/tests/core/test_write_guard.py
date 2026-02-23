from unittest.mock import MagicMock

import pytest
from sqlalchemy.exc import SQLAlchemyError

from app.core.exceptions import DataWriteException
from app.core.write_guard import commit_create, commit_update


class DummyEntity:
    def __init__(self, entity_id=None):
        self.id = entity_id


def test_commit_create_success():
    db = MagicMock()
    entity = DummyEntity(entity_id=1)

    commit_create(db, entity)

    db.flush.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(entity)
    db.rollback.assert_not_called()


def test_commit_create_raises_when_primary_key_missing():
    db = MagicMock()
    entity = DummyEntity(entity_id=None)

    with pytest.raises(DataWriteException) as exc:
        commit_create(db, entity)

    assert exc.value.status_code == 500
    assert exc.value.detail == "数据写入失败"
    db.flush.assert_called_once()
    db.rollback.assert_called_once()
    db.commit.assert_not_called()


def test_commit_create_raises_on_sqlalchemy_error():
    db = MagicMock()
    entity = DummyEntity(entity_id=1)
    db.commit.side_effect = SQLAlchemyError("commit failed")

    with pytest.raises(DataWriteException):
        commit_create(db, entity)

    db.flush.assert_called_once()
    db.commit.assert_called_once()
    db.rollback.assert_called_once()


def test_commit_update_raises_when_refresh_fails():
    db = MagicMock()
    entity = DummyEntity(entity_id=1)
    db.refresh.side_effect = RuntimeError("refresh failed")

    with pytest.raises(DataWriteException):
        commit_update(db, entity)

    db.flush.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(entity)
    db.rollback.assert_called_once()
