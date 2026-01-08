# Define the default action if you just type 'make'
.DEFAULT_GOAL := help

# Help command to list all available actions
help:
	@echo "Available commands:"
	@echo "  make up      - Build and start the containers"
	@echo "  make down    - Stop containers"
	@echo "  make reset   - Wipe everything (volumes included) and start fresh"
	@echo "  make db      - Enter the MySQL terminal inside the container"

up:
	docker compose up --build -d

down:
	docker compose down

reset:
	docker compose down -v
	docker compose up --build -d

db:
	docker compose exec db mysql -u blendata -p'l;ylfu=k;F]d1' auth

# This line ensures 'make' doesn't get confused if you have a file named 'up' or 'db'
.PHONY: up down reset logs db help