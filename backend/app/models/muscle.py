from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base


class Muscle(Base):
    """肌肉模型"""
    __tablename__ = "lifting_muscle"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    function = Column(String(255), nullable=True)
    origin_name = Column(String(100), nullable=True)
