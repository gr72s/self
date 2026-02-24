SHELL := /bin/sh
COMPOSE ?= sudo docker compose

.PHONY: first-up up down restart prepare-host-dirs

prepare-host-dirs:
	@set -eu; \
		if [ ! -f ./.env ]; then \
			echo "Missing .env file in project root"; \
			exit 1; \
		fi; \
		set -a; . ./.env; set +a; \
		if [ -z "$${SELF_HOME:-}" ] || [ -z "$${SELF_APP_HOME:-}" ]; then \
			echo "SELF_HOME and SELF_APP_HOME must be set in .env"; \
			exit 1; \
		fi; \
		echo "Preparing host directories for uid:gid 1001:1001"; \
		echo "SELF_HOME=$$SELF_HOME"; \
		echo "SELF_APP_HOME=$$SELF_APP_HOME"; \
		sudo mkdir -p "$$SELF_HOME" "$$SELF_APP_HOME"; \
		sudo chown -R 1001:1001 "$$SELF_HOME" "$$SELF_APP_HOME"; \
		sudo chmod -R u+rwX "$$SELF_HOME" "$$SELF_APP_HOME"

# first build + init + start (without cache)
first-up: prepare-host-dirs
	@$(COMPOSE) build --no-cache backend init
	@$(COMPOSE) --profile init run --rm init
	@$(COMPOSE) up -d backend

# build + start (without cache)
up: prepare-host-dirs
	@$(COMPOSE) build --no-cache backend
	@$(COMPOSE) up -d backend

# stop
down:
	@$(COMPOSE) down

# restart
restart:
	@$(COMPOSE) restart backend
