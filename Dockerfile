# 1. BASE IMAGE (IMPORTANT : CLI, pas FPM)
FROM php:8.2-cli

# 2. SYSTEM DEPENDENCIES
RUN apt-get update && apt-get install -y \
    git \
    zip \
    unzip \
    libzip-dev \
    libpq-dev \
    libicu-dev \
    libxml2-dev

# 3. PHP EXTENSIONS
RUN docker-php-ext-install pdo pdo_mysql zip

# 4. INSTALL COMPOSER
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. WORKDIR
WORKDIR /app

# 6. COPY PROJECT FILES
COPY . /app

# 7. FIX LARAVEL STORAGE + CACHE
RUN mkdir -p bootstrap/cache storage/logs storage/framework/{cache,sessions,views}
RUN chmod -R 777 storage bootstrap/cache

# 8. INSTALL DEPENDENCIES
RUN composer install --no-dev --optimize-autoloader

# 9. CLEAR + CACHE CONFIG
RUN php artisan config:clear || true
RUN php artisan cache:clear || true

# 10. PORT ENV FOR RAILWAY
ENV PORT=8080
EXPOSE 8080

# 11. START LARAVEL SERVER
CMD php artisan serve --host=0.0.0.0 --port=${PORT}