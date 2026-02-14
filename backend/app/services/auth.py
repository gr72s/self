from typing import Optional
from sqlalchemy.orm import Session
from app.models.auth import User
from app.core.security import verify_password, get_password_hash
from app.core.exceptions import NotFoundException, EntityAlreadyExistException


class AuthService:
    """认证服务"""
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        """验证用户"""
        user = db.query(User).filter(User.username == username).first()
        if not user or not verify_password(password, user.password_hash):
            return None
        return user
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_user_by_wechat_openid(db: Session, openid: str) -> Optional[User]:
        """根据微信openid获取用户"""
        return db.query(User).filter(User.wechat_openid == openid).first()
    
    @staticmethod
    def create_user(db: Session, username: str, password: str, **kwargs) -> User:
        """创建用户"""
        # 检查用户名是否已存在
        if AuthService.get_user_by_username(db, username):
            raise EntityAlreadyExistException("Username already exists")
        
        # 创建新用户
        user = User(
            username=username,
            password_hash=get_password_hash(password),
            **kwargs
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def create_or_update_wechat_user(db: Session, openid: str, **kwargs) -> User:
        """创建或更新微信用户"""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            logger.info(f"开始创建或更新微信用户，openid: {openid[:10]}...")
            
            # 查找现有用户
            logger.info("查找现有微信用户")
            user = AuthService.get_user_by_wechat_openid(db, openid)
            
            if user:
                # 更新现有用户
                logger.info(f"找到现有用户，user_id: {user.id}，开始更新用户信息")
                for key, value in kwargs.items():
                    if hasattr(user, key):
                        setattr(user, key, value)
                        logger.debug(f"更新用户字段: {key} = {value}")
                db.commit()
                db.refresh(user)
                logger.info(f"更新用户成功，user_id: {user.id}, nickname: {user.nickname}")
            else:
                # 创建新用户，确保密码长度不超过72字节
                logger.info("未找到现有用户，开始创建新用户")
                password = openid[:72]  # 截断密码，确保不超过72字节
                user = User(
                    username=f"wechat_{openid[:8]}",
                    password_hash=get_password_hash(password),  # 使用截断后的openid作为临时密码
                    wechat_openid=openid,
                    **kwargs
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                logger.info(f"创建新用户成功，user_id: {user.id}, username: {user.username}, nickname: {user.nickname}")
            
            logger.info(f"创建或更新微信用户完成，user_id: {user.id}")
            return user
        except Exception as e:
            logger.error(f"创建或更新微信用户失败: {str(e)}", exc_info=True)
            raise
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        """根据ID获取用户"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException("User not found")
        return user
