FROM php:8.2-cli

# Dépendances système
RUN apt-get update && apt-get install -y \
    git zip unzip libzip-dev \
    && docker-php-ext-install pdo pdo_mysql zip

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copier uniquement les fichiers nécessaires (bonne pratique)
COPY ./joyatwork-api/ /app/

# Permissions Laravel
RUN mkdir -p storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Installer les dépendances PHP
RUN composer install --no-dev --optimize-autoloader

# Port de l’application
ENV PORT=8080
EXPOSE 8080

# Lancer le serveur PHP
CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]