# Ziririt Journey Sharing App - Development Makefile

.PHONY: help install dev up down logs clean test build

# Default target
help:
	@echo "Ziririt Journey Sharing App - Available Commands:"
	@echo ""
	@echo "  make install     - Install all dependencies"
	@echo "  make dev         - Start all services in development mode"
	@echo "  make up          - Start all services using Docker Compose"
	@echo "  make down        - Stop all services"
	@echo "  make logs        - Show logs from all services"
	@echo "  make clean       - Clean up containers, volumes, and images"
	@echo "  make test        - Run all tests"
	@echo "  make build       - Build all Docker images"
	@echo ""
	@echo "  Database Commands:"
	@echo "  make db-reset    - Reset and reinitialize all databases"
	@echo "  make db-seed     - Seed databases with sample data"
	@echo ""
	@echo "  Individual Services:"
	@echo "  make auth        - Start only ziririt-auth-service"
	@echo "  make profile     - Start only ziririt-profile-service" 
	@echo "  make post        - Start only ziririt-post-service"
	@echo "  make feed        - Start only ziririt-feed-service"
	@echo "  make gateway     - Start only ziririt-api-gateway"

# Install dependencies for all services
install:
	@echo "Installing dependencies..."
	yarn install
	@if [ -d "backend/ziririt-auth-service" ]; then cd backend/ziririt-auth-service && yarn install; fi
	@if [ -d "backend/ziririt-profile-service" ]; then cd backend/ziririt-profile-service && yarn install; fi
	@if [ -d "backend/ziririt-post-service" ]; then cd backend/ziririt-post-service && yarn install; fi
	@if [ -d "backend/ziririt-feed-service" ]; then cd backend/ziririt-feed-service && yarn install; fi
	@if [ -d "backend/ziririt-api-gateway" ]; then cd backend/ziririt-api-gateway && yarn install; fi
	@if [ -d "frontend/app_client" ]; then cd frontend/app_client && npm install; fi

# Start all services in development mode
dev: up
	@echo "All services started in development mode"
	@echo "API Gateway: http://localhost:8080"
	@echo "Ziririt Auth Service: http://localhost:4101"
	@echo "Ziririt Profile Service: http://localhost:4102"
	@echo "Ziririt Post Service: http://localhost:4103"
	@echo "Ziririt Feed Service: http://localhost:4104"

# Start services with Docker Compose
up:
	@echo "Starting all services..."
	docker-compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 10
	@echo "Services are ready!"

# Stop all services
down:
	@echo "Stopping all services..."
	docker-compose down

# Show logs from all services
logs:
	docker-compose logs -f

# Clean up everything
clean:
	@echo "Cleaning up containers, volumes, and images..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	@echo "Cleanup complete!"

# Reset and reinitialize databases
db-reset: down
	@echo "Resetting databases..."
	docker-compose down -v
	docker-compose up -d postgres mongodb redis
	@sleep 10
	@echo "Databases reset complete!"

# Seed databases with sample data (already included in init scripts)
db-seed:
	@echo "Sample data is automatically seeded during database initialization"

# Run tests
test:
	@echo "Running tests..."
	@if [ -d "backend/ziririt-auth-service" ]; then cd backend/ziririt-auth-service && yarn test; fi
	@if [ -d "backend/ziririt-profile-service" ]; then cd backend/ziririt-profile-service && yarn test; fi
	@if [ -d "backend/ziririt-post-service" ]; then cd backend/ziririt-post-service && yarn test; fi
	@if [ -d "backend/ziririt-feed-service" ]; then cd backend/ziririt-feed-service && yarn test; fi
	@if [ -d "backend/ziririt-api-gateway" ]; then cd backend/ziririt-api-gateway && yarn test; fi

# Build all Docker images
build:
	@echo "Building Docker images..."
	docker-compose build

# Individual service commands
auth:
	docker-compose up -d postgres
	@sleep 5
	docker-compose up ziririt-auth-service

profile:
	docker-compose up -d postgres ziririt-auth-service
	@sleep 5
	docker-compose up ziririt-profile-service

post:
	docker-compose up -d mongodb ziririt-auth-service
	@sleep 5
	docker-compose up ziririt-post-service

feed:
	docker-compose up -d mongodb redis ziririt-auth-service ziririt-post-service ziririt-profile-service
	@sleep 5
	docker-compose up ziririt-feed-service

gateway:
	docker-compose up -d ziririt-auth-service ziririt-profile-service ziririt-post-service ziririt-feed-service
	@sleep 5
	docker-compose up ziririt-api-gateway

# Development helpers
status:
	@echo "Service Status:"
	@docker-compose ps

restart:
	docker-compose restart

# Database access helpers
db-psql:
	docker-compose exec postgres psql -U ziririt_user -d ziririt_db

db-mongo:
	docker-compose exec mongodb mongosh -u ziririt_user -p ziririt_password --authenticationDatabase admin ziririt_posts

db-redis:
	docker-compose exec redis redis-cli -a ziririt_password
