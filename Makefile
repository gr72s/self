SHELL := /bin/sh
COMPOSE ?= docker compose

.PHONY: first-up up down restart

# 第一次构建 + 初始化 + 启动（不使用 cache）
first-up:
	@$(COMPOSE) build --no-cache backend init
	@$(COMPOSE) --profile init run --rm init
	@$(COMPOSE) up -d backend

# 构建 + 启动（不使用 cache）
up:
	@$(COMPOSE) build --no-cache backend
	@$(COMPOSE) up -d backend

# 停止
down:
	@$(COMPOSE) down

# 重启
restart:
	@$(COMPOSE) restart backend

