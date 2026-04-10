#!/bin/bash

# Script de démarrage à la racine pour Railway

# Vérifier si on doit démarrer l'API ou le Hub
if [ "$SERVICE" = "hub" ]; then
    echo "🚀 Démarrage du Hub (React)..."
    cd joyatwork-hub
    npm install --production
    npm run build
    npm run preview
else
    echo "🚀 Démarrage de l'API (Laravel)..."
    cd joyatwork-api
    bash start.sh
fi
