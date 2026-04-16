FROM php:8.2-cli

# --------------------------------------------------
# Dépendances système pour Laravel
# --------------------------------------------------
RUN apt-get update && apt-get install -y \
    git unzip zip libzip-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring zip

# --------------------------------------------------
# Installer Composer
# --------------------------------------------------
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# --------------------------------------------------
# Dossier de travail (monorepo)
# --------------------------------------------------
WORKDIR /app/joyatwork-api

# --------------------------------------------------
# Copier le code Laravel
# --------------------------------------------------
COPY joyatwork-api/ /app/joyatwork-api/

# --------------------------------------------------
# ✅ CRÉER dossiers requis AVANT composer
# --------------------------------------------------
RUN mkdir -p storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    bootstrap/cache

# --------------------------------------------------
# ✅ Permissions AVANT composer (CRITIQUE)
# --------------------------------------------------
RUN chmod -R 777 storage bootstrap/cache

# --------------------------------------------------
# Installer dépendances PHP
# --------------------------------------------------
RUN composer install --no-dev --optimize-autoloader --no-interaction

# --------------------------------------------------
# Nettoyage cache Laravel
# --------------------------------------------------
RUN php artisan optimize:clear

# --------------------------------------------------
# Migrations (sécurisé)
# --------------------------------------------------
RUN php artisan migrate --force || true

# --------------------------------------------------
# Port Railway
# --------------------------------------------------
EXPOSE 8080

# --------------------------------------------------
# Démarrage Laravel
# --------------------------------------------------
CMD php artisan serve --host=0.0.0.0 --port=8080