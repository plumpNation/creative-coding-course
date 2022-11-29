# Handles passing the first argument provided to the new task
ifeq (new, $(firstword $(MAKECMDGOALS)))
  # use the next arguments for "new"
  NEW_ARG := $(wordlist 2, 2, $(MAKECMDGOALS))
  # ...and turn it into a "do-nothing" target
  $(eval $(NEW_ARG):;@:)
endif

triangle:
	pnpm run triangle

lines:
	pnpm run lines

curves:
	pnpm run curves

install:
	pnpm install

new: ## Create a new sketch
## Usage: make new [sketch name]
	npx canvas-sketch sketches/$(NEW_ARG).js --new

