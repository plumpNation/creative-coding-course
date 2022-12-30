# Handles passing the first argument provided to the new task
ifeq (new, $(firstword $(MAKECMDGOALS)))
  # use the next arguments for "new"
  NEW_ARG := $(wordlist 2, 2, $(MAKECMDGOALS))
  # ...and turn it into a "do-nothing" target
  $(eval $(NEW_ARG):;@:)
endif

HELP_TARGET_COLUMN_WIDTH := 30

.DEFAULT_GOAL := help

help: ## Display target descriptions
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	| sort \
	| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-$(HELP_TARGET_COLUMN_WIDTH)s\033[0m %s\n", $$1, $$2}'

sketch-triangle: ## Run triangle sketch
	pnpm run sketch:triangle

sketch-lines: ## Run lines sketch
	pnpm run sketch:lines

sketch-curves: ## Run curves sketch
	pnpm run sketch:curves

sketch-grid: ## Run grid sketch
	pnpm run sketch:grid

sketch-animation: ## Run animation sketch
	pnpm run sketch:animation

sketch-animation-export: ## Run animation sketch and export mp4
	pnpm run sketch:animation:export

sketch-audio-viz: ## Run audio visulation sketch
	pnpm run sketch:audioviz

install: ## Install dependencies
	pnpm install

new: ## Create a new sketch. Usage: make new [sketch name]
	npx canvas-sketch sketches/$(NEW_ARG).js --new

