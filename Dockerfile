# =========================
# 1. Image PHP
# =========================
FROM php:8.2-cli

# =========================
# 2. Dépendances système
# =========================
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip

# =========================
# 3. Extensions PHP
# =========================
RUN docker-php-ext-install pdo pdo_mysql zip

# =========================
# 4. Composer
# =========================
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# =========================
# 5. Dossier app
# =========================
WORKDIR /app

# =========================
# 6. Copier projet
# =========================
COPY . .

# =========================
# 7. Permissions Laravel (IMPORTANT)
# =========================
RUN mkdir -p storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# =========================
# 8. Installer dépendances Laravel
# =========================
RUN composer install --no-dev --optimize-autoloader

# =========================
# 9. Optimisation Laravel
# =========================
RUN php artisan config:clear \
    && php artisan cache:clear || true

# =========================
# 10. Port Railway
# =========================
ENV PORT=8080

EXPOSE 8080

# =========================
# 11. Start serveur Laravel
# =========================
CMD php artisan serve --host=0.0.0.0 --port=${PORT}