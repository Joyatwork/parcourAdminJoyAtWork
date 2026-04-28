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

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Create Laravel required folders
RUN mkdir -p bootstrap/cache \
    && mkdir -p storage/framework/{cache,sessions,views} \
    && chmod -R 777 storage bootstrap/cache

# Clear caches
RUN php artisan config:clear \
    && php artisan cache:clear \
    && php artisan route:clear

# Railway uses PORT env variable → default to 8080
ENV PORT=8080

EXPOSE 8080

CMD php artisan serve --host=0.0.0.0 --port=$PORT
