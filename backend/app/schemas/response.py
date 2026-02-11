from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel


class Response(BaseModel):
    """通用响应模型"""
    code: int = 200
    message: str = "success"
    data: Optional[Any] = None


T = TypeVar('T')


class PageResponse(BaseModel, Generic[T]):
    """分页响应模型"""
    total: int
    page: int
    size: int
    items: List[T]
