#!/bin/bash

# Script de démarrage pour Railway

# Variables
set -e

echo "🚀 Démarrage de l'API Laravel..."

# 1. Installer les dépendances PHP si nécessaire
if [ ! -d "vendor" ]; then
    echo "📦 Installation des dépendances Composer..."
    composer install --no-dev --optimize-autoloader
fi

# 2. Générer la clé APP si elle n'existe pas
if [ -z "$APP_KEY" ]; then
    echo "🔑 Génération de la clé APP..."
    php artisan key:generate
fi

# 3. Exécuter les migrations
echo "🗄️  Exécution des migrations..."
php artisan migrate --force

# 4. Nettoyer le cache
echo "🧹 Nettoyage du cache..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 5. Démarrer le serveur
echo "✅ Serveur web lancé!"
php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
