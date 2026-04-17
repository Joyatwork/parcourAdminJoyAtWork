# Utilisation de l'image PHP 8.2 CLI comme base
FROM php:8.2-cli

# Installation des dépendances système nécessaires pour Laravel
RUN apt-get update && apt-get install -y \
    git \
    zip \
    unzip \
    libzip-dev \
    && docker-php-ext-install pdo pdo_mysql zip

# Installation de Composer depuis l'image officielle
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Définition du répertoire de travail dans le conteneur
WORKDIR /app

# COPIE DU CODE SOURCE
# On utilise "." pour copier tout le contenu du dossier actuel vers /app
COPY . /app

# Gestion des permissions pour les dossiers Laravel (CRITIQUE)
RUN mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Installation des dépendances PHP via Composer
RUN composer install --no-dev --optimize-autoloader

# Nettoyage et mise en cache de la configuration Laravel
RUN php artisan config:clear || true \
    && php artisan cache:clear || true \
    && php artisan config:cache || true

# Configuration de l'environnement
ENV PORT=8080
EXPOSE 8080

# Commande pour lancer l'application sur le port configuré
CMD php artisan serve --host=0.0.0.0 --port=8080