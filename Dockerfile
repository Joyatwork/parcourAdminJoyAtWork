FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git zip unzip libzip-dev libpq-dev libicu-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY ./joyatwork-api /app

# 🔥 Laravel folders
RUN mkdir -p bootstrap/cache storage/logs storage/framework/{cache,sessions,views}

# 🔥 Permissions
RUN chmod -R 775 storage bootstrap/cache

# Install deps
RUN composer install --no-dev --optimize-autoloader

# Clear cache
RUN php artisan config:clear || true
RUN php artisan cache:clear || true

ENV PORT=8080
EXPOSE 8080

# 🔥 FIXED CMD
CMD php artisan serve --host=0.0.0.0 --port=8080