# FinanceFlow - Local Dev Makefile
# Faster than docker-compose: runs infra (postgres+redis) in Docker,
# backend and frontend natively with hot reload.
#
# Prerequisites:
#   - Java 21+     (java --version)
#   - Maven 3.9+   (mvn --version)
#   - Node 20+     (node --version)
#   - Docker       (docker --version)
#
# Install missing tools:
#   sudo apt install maven    # Ubuntu/Debian
#   brew install maven        # macOS

.DEFAULT_GOAL := help

.PHONY: help infra backend frontend dev stop clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-12s\033[0m %s\n", $$1, $$2}'

infra: ## Start PostgreSQL and Redis (Docker, no build needed)
	@# Remove stale redis container to avoid stale network references
	docker compose rm -s -f redis 2>/dev/null || true
	docker compose up -d postgres redis
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker compose exec postgres pg_isready -U financeflow -d financeflow >/dev/null 2>&1; do \
		sleep 1; \
	done
	@echo "Waiting for Redis to be ready..."
	@until docker compose exec redis redis-cli ping >/dev/null 2>&1; do \
		sleep 1; \
	done
	@echo "✓ Infra ready (PostgreSQL :5432, Redis :6379)"

backend: ## Start Spring Boot backend (port 8080, hot reload)
	@fuser -k 8080/tcp 2>/dev/null || true
	@echo "Starting backend..."
	cd backend && mvn spring-boot:run -DskipTests

frontend: ## Start Angular frontend (port 4200, hot reload)
	@echo "Starting frontend..."
	cd frontend && NG_CLI_ANALYTICS=false npx ng serve --host 0.0.0.0 --port 4200

dev: infra ## Start infra + backend + frontend simultaneously
	@echo "Starting backend and frontend in parallel..."
	$(MAKE) backend & (sleep 15 && $(MAKE) frontend) & wait

stop: ## Stop infra containers and dev servers
	@fuser -k 8080/tcp 2>/dev/null || true
	@fuser -k 4200/tcp 2>/dev/null || true
	docker compose stop postgres redis
	@echo "✓ Infra and dev servers stopped"

clean: stop ## Stop infra and remove volumes
	docker compose down -v postgres redis
	@echo "✓ Infra stopped and volumes removed"

.PHONY: reset-db
reset-db: ## Reset database (drop all data, re-run migrations)
	docker compose rm -s -f -v postgres
	docker compose up -d postgres
	@echo "Waiting for PostgreSQL..."
	@until docker compose exec postgres pg_isready -U financeflow -d financeflow >/dev/null 2>&1; do sleep 1; done
	@echo "✓ Database reset complete. Restart the backend to re-run migrations."
