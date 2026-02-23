from typing import Optional

from sqlalchemy.orm import Session

from app.core.exceptions import EntityAlreadyExistException, NotFoundException
from app.core.security import get_password_hash, verify_password
from app.core.write_guard import commit_create, commit_update
from app.models.auth import User


class AuthService:
    """Authentication service."""

    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        user = db.query(User).filter(User.username == username).first()
        if not user or not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_user_by_wechat_openid(db: Session, openid: str) -> Optional[User]:
        return db.query(User).filter(User.wechat_openid == openid).first()

    @staticmethod
    def create_user(db: Session, username: str, password: str, **kwargs) -> User:
        if AuthService.get_user_by_username(db, username):
            raise EntityAlreadyExistException("Username already exists")

        user = User(
            username=username,
            password_hash=get_password_hash(password),
            **kwargs,
        )
        db.add(user)
        commit_create(db, user)
        return user

    @staticmethod
    def create_or_update_wechat_user(db: Session, openid: str, **kwargs) -> User:
        import logging

        logger = logging.getLogger(__name__)

        try:
            logger.info("Start create_or_update_wechat_user, openid prefix: %s", openid[:10])
            user = AuthService.get_user_by_wechat_openid(db, openid)

            if user:
                for key, value in kwargs.items():
                    if hasattr(user, key):
                        setattr(user, key, value)
                commit_update(db, user)
                logger.info("Updated wechat user, user_id=%s", user.id)
            else:
                password = openid[:72]
                user = User(
                    username=f"wechat_{openid[:8]}",
                    password_hash=get_password_hash(password),
                    wechat_openid=openid,
                    **kwargs,
                )
                db.add(user)
                commit_create(db, user)
                logger.info("Created wechat user, user_id=%s", user.id)

            return user
        except Exception as exc:
            logger.error("Failed to create_or_update_wechat_user: %s", str(exc), exc_info=True)
            raise

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException("User not found")
        return user
