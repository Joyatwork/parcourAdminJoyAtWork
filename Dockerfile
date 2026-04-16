FROM php:8.2-cli

# --------------------------------------------------
# Dépendances système nécessaires à Laravel
# --------------------------------------------------
RUN apt-get update && apt-get install -y \
    git unzip zip libzip-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring zip

# --------------------------------------------------
# Installer Composer
# --------------------------------------------------
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# --------------------------------------------------
# Aller dans le backend Laravel (monorepo)
# --------------------------------------------------
WORKDIR /app/joyatwork-api

# --------------------------------------------------
# Copier UNIQUEMENT le backend Laravel
# --------------------------------------------------
COPY joyatwork-api/ /app/joyatwork-api/

# --------------------------------------------------
# Installer les dépendances PHP
# --------------------------------------------------
RUN composer install --no-dev --optimize-autoloader

# --------------------------------------------------
# Nettoyer le cache Laravel
# --------------------------------------------------
RUN php artisan optimize:clear

# --------------------------------------------------
# ✅ Lancer les migrations en production (safe)
# --------------------------------------------------
RUN php artisan migrate --force || true

# --------------------------------------------------
# ✅ Permissions CRITIQUES pour éviter l'erreur 500
# --------------------------------------------------
RUN chmod -R 777 storage bootstrap/cache

# --------------------------------------------------
# Railway utilise UNIQUEMENT le port 8080
# --------------------------------------------------
EXPOSE 8080

# --------------------------------------------------
# Démarrage de Laravel
# --------------------------------------------------
CMD php artisan serve --host=0.0.0.0 --port=8080