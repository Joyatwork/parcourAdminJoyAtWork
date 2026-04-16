# =========================
# PHP BASE IMAGE
# =========================
FROM php:8.2-cli

# =========================
# SYSTEM DEPENDENCIES
# =========================
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    zip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev

# =========================
# PHP EXTENSIONS
# =========================
RUN docker-php-ext-install pdo pdo_mysql zip

# =========================
# COMPOSER
# =========================
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# =========================
# WORKDIR
# =========================
WORKDIR /app

# =========================
# COPY PROJECT (IMPORTANT)
# =========================
COPY joyatwork-api/ ./joyatwork-api

WORKDIR /app/joyatwork-api

# =========================
# FIX LARAVEL STORAGE + CACHE (CRUCIAL)
# =========================
RUN mkdir -p bootstrap/cache storage/logs storage/framework \
    && chmod -R 777 bootstrap/cache storage

# =========================
# INSTALL DEPENDENCIES
# =========================
RUN composer install --no-dev --optimize-autoloader

# =========================
# LARAVEL CACHE SAFETY
# =========================
RUN php artisan config:clear || true
RUN php artisan cache:clear || true

# =========================
# ENV PORT RAILWAY
# =========================
ENV PORT=8080

EXPOSE 8080

# =========================
# START LARAVEL SERVER
# =========================
CMD php artisan serve --host=0.0.0.0 --port=${PORT}