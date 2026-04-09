# Image PHP
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

# Dossier de travail
WORKDIR /app

# Copier tous les fichiers du projet
COPY . .

# Installer dépendances Laravel
RUN composer install --no-dev --optimize-autoloader

# Donner les permissions nécessaires
RUN chmod -R 775 storage bootstrap/cache

# Exposer le port (Railway utilisera PORT)
EXPOSE 8000

# Lancer le serveur Laravel avec le bon port
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-8000}