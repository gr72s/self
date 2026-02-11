from fastapi import HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional


class EntityAlreadyExistException(HTTPException):
    """实体已存在异常"""
    def __init__(self, detail: str = "Entity already exists"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
        )


class IllegalRequestArgumentException(HTTPException):
    """非法请求参数异常"""
    def __init__(self, detail: str = "Illegal request argument"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )


class NotFoundException(HTTPException):
    """资源未找到异常"""
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )


class UnauthorizedException(HTTPException):
    """未授权异常"""
    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenException(HTTPException):
    """禁止访问异常"""
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


class NotFoundWeChatConfig(HTTPException):
    """微信配置未找到异常"""
    def __init__(self, detail: str = "WeChat config not found"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )


async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理器"""
    # 处理HTTP异常
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "code": exc.status_code,
                "message": exc.detail,
                "data": None
            }
        )
    
    # 处理SQLAlchemy异常
    if isinstance(exc, SQLAlchemyError):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message": "Database error",
                "data": None
            }
        )
    
    # 处理其他异常
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "message": "Internal server error",
            "data": None
        }
    )
