FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl unzip libzip-dev libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql zip gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy ONLY the backend
COPY joyatwork-api/ .

# Create Laravel required folders BEFORE composer install
RUN mkdir -p bootstrap/cache \
    && mkdir -p storage/framework/cache \
    && mkdir -p storage/framework/sessions \
    && mkdir -p storage/framework/views \
    && chmod -R 777 bootstrap/cache storage

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && php artisan package:discover --ansi \
    && chmod -R 775 bootstrap/cache storage

# Railway uses PORT env variable → default to 8080
ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "php artisan migrate --force && (php artisan storage:link 2>/dev/null || true) && exec php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]
