#!/bin/bash
set -e

echo "==> Clearing config and cache..."
php artisan config:clear
php artisan cache:clear

echo "==> Running database migrations..."
php artisan migrate --force

echo "==> Starting Laravel server on port ${PORT:-8080}..."
php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
