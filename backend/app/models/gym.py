from sqlalchemy import Column, Integer, String
from app.core.database import Base


class Gym(Base):
    """健身房模型"""
    __tablename__ = "lifting_gym"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    location = Column(String(200), nullable=False)
