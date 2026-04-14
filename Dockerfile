FROM php:8.2-cli
RUN apt-get update && apt-get install -y git curl unzip libzip-dev \
    && docker-php-ext-install pdo_mysql zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN cd joyatwork-api && composer install --no-dev --optimize-autoloader

EXPOSE 8001

CMD cd joyatwork-api && php artisan serve --host=0.0.0.0 --port=${PORT:-8001}
