# Image PHP pour API Laravel
FROM php:8.2-cli

# Installer dépendances système + extensions PHP nécessaires
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libzip-dev \
    zip \
    && docker-php-ext-install pdo_mysql zip

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Dossier de travail pour l'API
WORKDIR /app

# Copier les fichiers de l'API
COPY joyatwork-api/ .

# Installer dépendances Laravel
RUN composer install --no-dev --optimize-autoloader

# Donner les permissions nécessaires
RUN chmod -R 775 storage bootstrap/cache

# Exposer le port
EXPOSE 8000

# Lancer le serveur Laravel
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
