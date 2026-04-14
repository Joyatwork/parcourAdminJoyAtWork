FROM php:8.2-cli

# Install dependencies
RUN apt-get update && apt-get install -y \
    git curl unzip libzip-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql zip mbstring xml bcmath

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy project
COPY . .

# Move into Laravel project
WORKDIR /app/joyatwork-api

# 1. Create .env if missing
RUN cp .env.example .env || true

# 2. Install dependencies WITHOUT scripts (IMPORTANT)
RUN composer install --no-dev --no-interaction --no-scripts --optimize-autoloader

# 3. Generate key (safe even if fails)
RUN php artisan key:generate || true

# 4. Fix cache issues
RUN php artisan config:clear || true
RUN php artisan cache:clear || true

EXPOSE 8001

CMD php artisan serve --host=0.0.0.0 --port=${PORT:-8001}
