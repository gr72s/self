# Self API Backend

## Overview

Self API backend is a FastAPI + SQLAlchemy service with a CLI entrypoint `self`.

## Quick Start

```bash
cd backend
pip install -r requirements.txt
pip install -e .
```

## Startup Compatibility

Two startup styles are supported and share the same backend code:

1. `self` CLI startup (recommended)

```bash
self start
```

2. Direct `uvicorn` startup (compatible)

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Notes:

- `self start` uses unified runtime config (`app/runtime/server.py`).
- Direct `uvicorn` remains available for local debugging or custom flags.

## Database Initialization

```bash
self init-db
```

`self init-project` also runs database initialization after preparing config and credentials.

## CLI Commands

```bash
self init-project --boot-env production
self check-project
self init-db
self start
self stop
self run <command>
self uninstall-self
```

## Docker Profiles

From repo root:

```bash
docker compose --profile init run --rm --build init
docker compose up -d --build backend
docker compose --profile uninstall run --rm --build uninstall
```

## Directory Structure

```text
backend/
  app/
    api/
    core/
    models/
    runtime/        # unified startup/db init/uninstall runtime
    schemas/
    services/
  cli/
    commands/
  data/             # seed SQL files
  main.py
  setup.py
  requirements.txt
```
