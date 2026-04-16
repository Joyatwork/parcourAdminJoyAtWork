FROM php:8.2-cli

# Installer dépendances
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev zip curl \
    && docker-php-ext-install zip pdo pdo_mysql

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copier backend
COPY joyatwork-api /app

# Installer Laravel
RUN composer install --no-dev --optimize-autoloader

# 🔥 CRÉER dossiers manquants
RUN mkdir -p storage bootstrap/cache

# 🔥 DONNER PERMISSIONS
RUN chmod -R 775 storage bootstrap/cache

# Exposer port Railway
EXPOSE 8080

# Lancer Laravel
CMD php artisan config:clear && \
    php artisan cache:clear && \
    php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=8080