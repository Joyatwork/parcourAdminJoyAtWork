FROM php:8.2-cli

# Dépendances système
RUN apt-get update && apt-get install -y \
    git unzip zip libzip-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring zip

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Aller DIRECTEMENT dans le backend Laravel
WORKDIR /app/joyatwork-api

# Copier UNIQUEMENT le backend Laravel
COPY joyatwork-api/ /app/joyatwork-api/

# Installer dépendances PHP
RUN composer install --no-dev --optimize-autoloader

# Nettoyage cache Laravel (CRUCIAL)
RUN php artisan optimize:clear

# Railway utilise 8080
EXPOSE 8080

# Démarrage Laravel
CMD php artisan serve --host=0.0.0.0 --port=8080