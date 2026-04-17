# Utilisation de l'image PHP 8.2 CLI officielle
FROM php:8.2-cli

# Installation des dépendances système pour PHP et Laravel
RUN apt-get update && apt-get install -y \
    git \
    zip \
    unzip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql gd mbstring zip

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Définition du dossier de travail
WORKDIR /app

# Copie de l'intégralité du projet
COPY . .

# Création des dossiers nécessaires et gestion des permissions
RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Installation des dépendances sans les outils de dev pour la prod
RUN composer install --no-dev --optimize-autoloader

# Nettoyage des caches au build
RUN php artisan config:clear || true \
    && php artisan cache:clear || true

# Configuration des ports
ENV PORT=8080
EXPOSE 8080

# COMMANDE DE DÉMARRAGE (Migration + Serveur)
# Le --force est obligatoire pour exécuter les migrations en production sur Railway
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8080