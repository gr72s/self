from sqlalchemy import Column, Integer, String
from app.core.database import Base


class Target(Base):
    """目标模型"""
    __tablename__ = "lifting_target"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
