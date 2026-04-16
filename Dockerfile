FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git unzip curl zip \
    libzip-dev libpng-dev libonig-dev libxml2-dev

RUN docker-php-ext-install pdo pdo_mysql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# 👇 IMPORTANT: ton backend est dans ce dossier
COPY joyatwork-api/ ./joyatwork-api

WORKDIR /app/joyatwork-api

RUN composer install --no-dev --optimize-autoloader

RUN mkdir -p storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8080

CMD php artisan serve --host=0.0.0.0 --port=8080