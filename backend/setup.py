from setuptools import setup, find_packages

setup(
    name="self-api",
    version="1.0.0",
    description="Self API Backend",
    packages=find_packages(),
    entry_points={
        "console_scripts": ["self=cli.main:self_cli"],
    },
    install_requires=[
        "fastapi",
        "uvicorn[standard]",
        "sqlalchemy",
        "python-dotenv",
        "pytest",
        "pytest-asyncio",
        "httpx",
        "pydantic",
        "pydantic-settings",
        "python-jose[cryptography]",
        "passlib[pbkdf2_sha256]",
        "python-multipart",
        "click"
    ],
)