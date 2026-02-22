# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Self is a fitness training management system with a FastAPI backend and WeChat mini-program frontend.

## Architecture

**Backend (FastAPI + SQLAlchemy)**
- `backend/app/api/` - API route handlers
- `backend/app/services/` - Business logic layer
- `backend/app/models/` - SQLAlchemy ORM models
- `backend/app/schemas/` - Pydantic validation schemas
- `backend/app/core/` - Core configuration (database, security, exceptions)
- `backend/main.py` - Application entry point with router registration

**Data Flow**: API routes → Services → Models → Database

**Authentication**: JWT tokens with 7-day expiration. WeChat login supported via `/api/auth/wechat/login`.

**Configuration**: Environment-based via `SELF_ENV` (development/testing/production). WeChat credentials loaded from `~/.self/config.json` or environment variables.

## Development Commands

### Backend

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Initialize database with default data
python init_db.py

# Run development server
uvicorn main:app --reload

# Run tests
cd backend
pytest

# Run specific test file
pytest tests/api/test_auth.py
```

### Docker

```bash
# Build and start services
docker-compose up -d

# View backend logs
docker-compose logs backend

# Stop services
docker-compose down
```

### Commit Convention

This project uses Conventional Commits enforced by husky and commitlint. Format: `<type>(<scope>): <subject>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`

Only `feat` and `fix` trigger CI/CD deployment.

## Testing

Tests use pytest with function-scoped fixtures. Each test gets a fresh database with test data from `backend/data/*.sql`. Default test user: `testuser` / `testpassword`.

## Database

SQLite with environment-specific files:
- Development: `backend/self.dev.db`
- Testing: `backend/self.test.db`
- Production: `backend/self.db`
