.DEFAULT_GOAL := help
.PHONY: help install dev build start lint typecheck test format check

help: ## Show this help
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	pnpm install

dev: ## Run the dev server (needs Jungo running, see .env.local)
	pnpm dev

build: ## Production build (standalone output)
	pnpm build

start: ## Run the production build
	pnpm start

lint: ## ESLint
	pnpm lint

typecheck: ## TypeScript
	pnpm typecheck

test: ## Unit and architecture tests
	pnpm test

format: ## Prettier write
	pnpm format

check: ## Everything CI runs
	pnpm check
