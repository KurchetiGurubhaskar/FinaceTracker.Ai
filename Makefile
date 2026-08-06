build:
	docker-compose build

up:
	docker-compose up

down:
	docker-compose down

shell-backend:
	docker-compose exec backend bash

migrate:
	docker-compose exec backend python manage.py migrate

makemigrations:
	docker-compose exec backend python manage.py makemigrations
