FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git zip unzip libzip-dev \
    && docker-php-ext-install pdo pdo_mysql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY ./joyatwork-api /app

# Laravel folders + permissions
RUN mkdir -p storage \
    storage/logs \
    storage/framework \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

RUN composer install --no-dev --optimize-autoloader

ENV PORT=8080
EXPOSE 8080

CMD php -S 0.0.0.0:8080 -t public