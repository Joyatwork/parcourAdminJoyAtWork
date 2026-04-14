#!/bin/bash
# Manual deployment script - Déploiement manuel de Parcour Admin sur le VPS
# Usage: ./deploy/deploy-manual.sh <VPS_HOST> <VPS_USER> <SSH_KEY_PATH>
# Example: ./deploy/deploy-manual.sh 192.168.1.100 deploy ~/.ssh/gitlab_deploy

set -e

# Variables
VPS_HOST=${1:-"change-me.example.com"}
VPS_USER=${2:-"deploy"}
SSH_KEY=${3:-"$HOME/.ssh/gitlab_deploy"}
APP_DIR="/var/www/parcour-admin"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Démarrage du déploiement manuel...${NC}"
echo "VPS: $VPS_HOST"
echo "User: $VPS_USER"
echo ""

# Vérifier que la clé SSH existe
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ Clé SSH non trouvée: $SSH_KEY${NC}"
    exit 1
fi

# Vérifier la connexion SSH
echo -e "${YELLOW}🔐 Vérification de la connexion SSH...${NC}"
if ! ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "echo 'SSH OK'" > /dev/null 2>&1; then
    echo -e "${RED}❌ Impossible de se connecter au VPS${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Connexion SSH OK${NC}"
echo ""

# Build backend
echo -e "${YELLOW}🔨 Build du backend Laravel...${NC}"
if [ -d "joyatwork-api" ]; then
    cd joyatwork-api
    echo "📦 Installation des dépendances PHP..."
    composer install --no-dev --optimize-autoloader
    cd ..
    echo -e "${GREEN}✅ Backend build complété${NC}"
else
    echo -e "${RED}❌ Répertoire joyatwork-api non trouvé${NC}"
    exit 1
fi
echo ""

# Build frontend
echo -e "${YELLOW}⚛️  Build du frontend React...${NC}"
if [ -d "joyatwork-hub" ]; then
    cd joyatwork-hub
    echo "📦 Installation des dépendances Node..."
    npm ci
    echo "🏗️  Construction de la prod..."
    npm run build
    cd ..
    echo -e "${GREEN}✅ Frontend build complété${NC}"
else
    echo -e "${RED}❌ Répertoire joyatwork-hub non trouvé${NC}"
    exit 1
fi
echo ""

# Backup ancien déploiement
echo -e "${YELLOW}💾 Création d'un backup du déploiement actuel...${NC}"
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "
    if [ -d '$APP_DIR/api' ]; then
        tar -czf '$APP_DIR/backups/api_backup_$TIMESTAMP.tar.gz' '$APP_DIR/api' 2>/dev/null || true
        echo '✅ Backup de l'API créé'
    fi
    if [ -d '$APP_DIR/hub' ]; then
        tar -czf '$APP_DIR/backups/hub_backup_$TIMESTAMP.tar.gz' '$APP_DIR/hub' 2>/dev/null || true
        echo '✅ Backup du Hub créé'
    fi
"
echo ""

# Déployer l'API
echo -e "${YELLOW}📤 Déploiement du backend sur le VPS...${NC}"
rsync -avz --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.env.local' \
    --exclude='storage/logs/*' \
    -e "ssh -i $SSH_KEY" \
    joyatwork-api/ \
    "$VPS_USER@$VPS_HOST:$APP_DIR/api/"

echo -e "${GREEN}✅ Backend déployé${NC}"
echo ""

# Déployer le Hub
echo -e "${YELLOW}📤 Déploiement du frontend sur le VPS...${NC}"
rsync -avz --delete \
    -e "ssh -i $SSH_KEY" \
    joyatwork-hub/dist/ \
    "$VPS_USER@$VPS_HOST:$APP_DIR/hub/"

echo -e "${GREEN}✅ Frontend déployé${NC}"
echo ""

# Post-déploiement
echo -e "${YELLOW}🔧 Configuration post-déploiement...${NC}"
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "
    set -e
    cd $APP_DIR/api
    
    # Générer la clé app (si .env n'existe pas)
    if [ ! -f '.env' ]; then
        echo '⚠️  Création d'un .env par défaut (À PERSONNALISER)'
        cp .env.example .env || echo 'APP_KEY=' > .env
    fi
    
    # Cache clear
    php artisan config:cache
    php artisan route:cache
    
    # Migrations
    echo '🔄 Exécution des migrations...'
    php artisan migrate --force
    
    # Permissions
    echo '🔐 Configuration des permissions...'
    chmod -R 775 storage/logs/
    
    echo -e '${GREEN}✅ Post-déploiement complété${NC}'
"

# Recharger les services
echo -e "${YELLOW}🔄 Rechargement des services...${NC}"
ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "
    sudo systemctl reload nginx
    echo '✅ Nginx rechargé'
"

# Sanity check
echo -e "${YELLOW}🏥 Sanity check...${NC}"
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://$VPS_HOST/health || echo "000")

if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}✅ Health check OK (HTTP $HEALTH_CHECK)${NC}"
else
    echo -e "${YELLOW}⚠️  Health check Status: HTTP $HEALTH_CHECK${NC}"
fi

echo ""
echo -e "${GREEN}✨ Déploiement complété ! ✨${NC}"
echo ""
echo "📍 Accès :"
echo "  - Frontend  : https://$VPS_HOST"
echo "  - API       : https://$VPS_HOST/api"
echo "  - Health    : https://$VPS_HOST/health"
echo ""
echo "📊 Logs :"
echo "  ssh -i $SSH_KEY $VPS_USER@$VPS_HOST"
echo "  sudo tail -f /var/log/nginx/parcour-admin-error.log"
echo ""
