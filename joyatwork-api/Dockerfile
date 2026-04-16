FROM php:8.2-cli

# Installer dépendances système
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev zip curl \
    && docker-php-ext-install zip pdo pdo_mysql

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Définir le dossier de travail
WORKDIR /app

# Copier uniquement le backend
COPY joyatwork-api /app

# Installer dépendances Laravel
RUN composer install --no-dev --optimize-autoloader

# Create storage directories and set permissions
RUN mkdir -p /app/storage/logs \
    && mkdir -p /app/storage/app/public \
    && mkdir -p /app/storage/framework/cache \
    && mkdir -p /app/storage/framework/sessions \
    && mkdir -p /app/storage/framework/views \
    && chmod -R 775 /app/storage \
    && chmod -R 775 /app/bootstrap/cache

# Exposer port
EXPOSE 8080

# Lancer Laravel
CMD ["/bin/bash", "/app/bootstrap-app.sh"]