from __future__ import annotations

import os
from dataclasses import dataclass

import uvicorn

from app.core.config import settings


@dataclass(frozen=True)
class ServerConfig:
    host: str
    port: int
    reload: bool
    app: str = "main:app"


def get_server_config() -> ServerConfig:
    env = settings.ENVIRONMENT.lower()
    reload_enabled = env == "development"
    return ServerConfig(host="0.0.0.0", port=8000, reload=reload_enabled)


def run_server() -> None:
    cfg = get_server_config()
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    uvicorn.run(cfg.app, host=cfg.host, port=cfg.port, reload=cfg.reload, app_dir=backend_dir)

