#!/bin/bash
# 🔑 Setup SSH Keys - À exécuter sur ta machine locale (Windows avec Git Bash)
# 
# Usage:
#   bash deploy/setup-local.sh <VPS_IP> <VPS_USER>
#   bash deploy/setup-local.sh 192.168.1.100 deploy
#
# Ce script va :
# 1. Générer la paire de clés SSH
# 2. Ajouter la clé publique au VPS
# 3. Tester la connexion

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vérifier les arguments
if [ -z "$1" ] || [ -z "$2" ]; then
    echo -e "${RED}❌ Usage: bash deploy/setup-local.sh <VPS_IP> <VPS_USER>${NC}"
    echo -e "${YELLOW}Exemple: bash deploy/setup-local.sh 192.168.1.100 deploy${NC}"
    exit 1
fi

VPS_IP=$1
VPS_USER=$2
SSH_KEY="$HOME/.ssh/gitlab_deploy"

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🔑 SETUP SSH KEYS - LOCAL MACHINE${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "VPS IP: $VPS_IP"
echo "VPS User: $VPS_USER"
echo ""

# ==========================================
# STEP 1: Generate SSH Key
# ==========================================
echo -e "${YELLOW}[1/4] 🔐 Génération de la clé SSH...${NC}"

if [ -f "$SSH_KEY" ]; then
    echo -e "${YELLOW}⚠️  La clé $SSH_KEY existe déjà${NC}"
    read -p "La réutiliser ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        rm -f "$SSH_KEY" "$SSH_KEY.pub"
        ssh-keygen -t ed25519 -C 'gitlab-deploy' -f "$SSH_KEY" -N ""
        echo -e "${GREEN}✅ Clé SSH générée${NC}"
    else
        echo -e "${GREEN}✅ Clé SSH réutilisée${NC}"
    fi
else
    ssh-keygen -t ed25519 -C 'gitlab-deploy' -f "$SSH_KEY" -N ""
    echo -e "${GREEN}✅ Clé SSH générée${NC}"
fi

echo ""

# ==========================================
# STEP 2: Add Public Key to VPS
# ==========================================
echo -e "${YELLOW}[2/4] 📤 Ajout de la clé publique au VPS...${NC}"

if ! ssh -o ConnectTimeout=5 ${VPS_USER}@${VPS_IP} "echo 'test' > /dev/null" 2>/dev/null; then
    echo -e "${RED}❌ Impossible de se connecter au VPS sans mot de passe${NC}"
    echo -e "${YELLOW}ℹ️  Essaie de te connecter manuellement d'abord :${NC}"
    echo -e "${YELLOW}    ssh ${VPS_USER}@${VPS_IP}${NC}"
    exit 1
fi

cat "$SSH_KEY.pub" | ssh ${VPS_USER}@${VPS_IP} "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
echo -e "${GREEN}✅ Clé publique ajoutée au VPS${NC}"

echo ""

# ==========================================
# STEP 3: Test Connection
# ==========================================
echo -e "${YELLOW}[3/4] 🧪 Test de la connexion SSH...${NC}"

if ssh -i "$SSH_KEY" ${VPS_USER}@${VPS_IP} "echo 'SSH Connection OK!'" > /dev/null; then
    echo -e "${GREEN}✅ Connexion SSH OK!${NC}"
else
    echo -e "${RED}❌ Connexion SSH échouée${NC}"
    exit 1
fi

echo ""

# ==========================================
# STEP 4: Display Private Key Content
# ==========================================
echo -e "${YELLOW}[4/4] 📋 Affichage de la clé privée (pour GitLab)...${NC}"
echo ""
echo -e "${YELLOW}Copie le contenu ci-dessous et colle-le dans GitLab CI/CD Variables${NC}"
echo -e "${YELLOW}(Settings → CI/CD → Variables → SSH_PRIVATE_KEY)${NC}"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
cat "$SSH_KEY"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

# ==========================================
# SUCCESS
# ==========================================
echo -e "${GREEN}✨ Setup local terminé !${NC}"
echo ""
echo -e "${BLUE}📋 Prochaines étapes :${NC}"
echo -e "  1. Copie la clé privée affichée ci-dessus"
echo -e "  2. Va sur GitLab → Settings → CI/CD → Variables"
echo -e "  3. Crée une variable 'SSH_PRIVATE_KEY' (type: File, masked)"
echo -e "  4. Colle la clé privée"
echo -e ""
echo -e "${BLUE}📊 Infos SSH :${NC}"
echo -e "  Clé privée  : $SSH_KEY"
echo -e "  Clé publique: $SSH_KEY.pub"
echo -e "  VPS         : ${VPS_USER}@${VPS_IP}"
echo ""
