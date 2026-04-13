#!/bin/bash
# 📋 GITLAB CI/CD VARIABLES SETUP GUIDE
# 
# Ce script affiche les variables que tu dois créer dans GitLab
# et comment les ajouter
#
# Usage: bash deploy/setup-gitlab-vars.sh <VPS_IP> <VPS_USER>

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Default values
VPS_IP=${1:-"YOUR_VPS_IP_HERE"}
VPS_USER=${2:-"deploy"}

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📋 GITLAB CI/CD VARIABLES SETUP GUIDE${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Étapes à suivre :${NC}"
echo ""
echo "1️⃣  Va sur GitLab:"
echo "   https://gitlab.com/Joyatwork/parcourAdminJoyAtWork"
echo ""
echo "2️⃣  Clique sur: Settings → CI/CD → Variables"
echo ""
echo "3️⃣  Crée ces 3 variables :"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}VARIABLE 1: SSH_PRIVATE_KEY${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Type        : ${YELLOW}File${NC}"
echo -e "  Masked      : ${YELLOW}✅ OUI${NC}"
echo -e "  Value       : $(cat ~/.ssh/gitlab_deploy 2>/dev/null | head -1 || echo '(Voir deploy/setup-local.sh)')..."
echo ""
echo -e "${YELLOW}⚠️  ACTION:${NC}"
echo "  1. Exécute sur ta machine locale :"
echo "     cat ~/.ssh/gitlab_deploy"
echo "  2. Copie TOUT le contenu (avec -----BEGIN et -----END)"
echo "  3. Colle dans GitLab"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}VARIABLE 2: VPS_HOST${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Type        : ${YELLOW}Variable${NC}"
echo -e "  Masked      : ${YELLOW}⭕ NON${NC}"
echo -e "  Value       : ${YELLOW}${VPS_IP}${NC}"
echo ""
echo -e "${YELLOW}ℹ️  REMPLACE ${VPS_IP} PAR :${NC}"
echo "  - L'IP du VPS (ex: 192.168.1.100)"
echo "  - OU le domaine (ex: parcouadmin.joyatwork.com)"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}VARIABLE 3: VPS_USER${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  Type        : ${YELLOW}Variable${NC}"
echo -e "  Masked      : ${YELLOW}⭕ NON${NC}"
echo -e "  Value       : ${YELLOW}${VPS_USER}${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}✅ Après avoir ajouté les 3 variables dans GitLab :${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Va sur GitLab → CI/CD → Pipelines"
echo "Tu devrais voir les variables dans 'Settings > CI/CD > Variables'"
echo ""
echo -e "${GREEN}C'est prêt pour le déploiement !${NC}"
echo ""
