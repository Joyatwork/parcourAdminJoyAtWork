#!/bin/bash
# Setup script for GitLab CI/CD deployment on Ubuntu VPS
# Usage: curl https://raw.githubusercontent.com/Joyatwork/parcourAdminJoyAtWork/dev/deploy/setup-vps.sh | bash

set -e

echo "🚀 Démarrage du setup VPS pour Parcour Admin..."

# ==========================================
# 1. SYSTEM UPDATE
# ==========================================
echo "📦 Mise à jour du système..."
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y curl wget git htop build-essential

# ==========================================
# 2. INSTALLATION NGINX
# ==========================================
echo "🌐 Installation de Nginx..."
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# ==========================================
# 3. INSTALLATION PHP (Laravel)
# ==========================================
echo "🐘 Installation de PHP 8.2..."
sudo apt-get install -y php8.2-cli php8.2-fpm php8.2-pdo php8.2-mysql php8.2-zip php8.2-gd php8.2-curl
sudo systemctl enable php8.2-fpm
sudo systemctl start php8.2-fpm

# ==========================================
# 4. INSTALLATION NODE.JS (React)
# ==========================================
echo "⚛️  Installation de Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# ==========================================
# 5. CRÉATION UTILISATEUR DE DÉPLOIEMENT
# ==========================================
echo "👤 Création de l'utilisateur de déploiement..."
if ! id -u deploy > /dev/null 2>&1; then
    sudo useradd -m -s /bin/bash deploy
    sudo mkdir -p /home/deploy/.ssh
    sudo chmod 700 /home/deploy/.ssh
    echo "Utilisateur 'deploy' créé."
else
    echo "Utilisateur 'deploy' existe déjà."
fi

# Donner les droits Nginx à l'utilisateur deploy
sudo usermod -aG www-data deploy
sudo chmod -R 755 /var/www

# ==========================================
# 6. CRÉATION STRUCTURE APPLICATIVE
# ==========================================
echo "📁 Création de la structure d'application..."
sudo mkdir -p /var/www/parcour-admin/{api,hub,logs}
sudo chown -R deploy:www-data /var/www/parcour-admin
sudo chmod -R 775 /var/www/parcour-admin
sudo chmod -R 775 /var/www/parcour-admin/logs

# ==========================================
# 7. INSTALLATION CERTBOT (Let's Encrypt)
# ==========================================
echo "🔐 Installation de Certbot pour SSL/TLS..."
sudo apt-get install -y certbot python3-certbot-nginx
echo "⚠️  Avant de continuer, remplace 'example.com' dans la commande ci-dessous :"
echo "sudo certbot --nginx -d parcouadmin.joyatwork.com -d www.parcouadmin.joyatwork.com"
echo "(Exécute cette commande manuellement après ce script)"

# ==========================================
# 8. COPIE CONFIGURATION NGINX
# ==========================================
echo "⚙️  Configuration de Nginx..."
if [ -f ./deploy/nginx-parcour-admin.conf ]; then
    sudo cp ./deploy/nginx-parcour-admin.conf /etc/nginx/sites-available/parcour-admin
    sudo ln -sf /etc/nginx/sites-available/parcour-admin /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test config
    sudo nginx -t && echo "✅ Config Nginx valide"
    sudo systemctl reload nginx
else
    echo "❌ Fichier nginx-parcour-admin.conf non trouvé!"
fi

# ==========================================
# 9. INSTALLATION ET CONFIGURATION GITLAB RUNNER
# ==========================================
echo "🏃 Installation du GitLab Runner..."
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt-get install -y gitlab-runner
sudo usermod -aG docker gitlab-runner
sudo systemctl enable gitlab-runner
sudo systemctl start gitlab-runner

echo "⚠️  Enregistrement du Runner - À toi de terminer :"
echo "1. Va sur: https://gitlab.com/Joyatwork/parcourAdminJoyAtWork/-/settings/ci_cd"
echo "2. Copie le Runner registration token"
echo "3. Exécute: sudo gitlab-runner register"
echo "   - URL: https://gitlab.com/"
echo "   - Token: <Paste token>"
echo "   - Description: VPS Production Runner"
echo "   - Tags: production,vps"
echo "   - Executor: shell"

# ==========================================
# 10. CONFIGURATION SUDOERS POUR GITLAB RUNNER
# ==========================================
echo "🔐 Configuration sudo pour GitLab Runner..."
echo "deploy ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx" | sudo tee -a /etc/sudoers.d/deploy > /dev/null
echo "deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart php8.2-fpm" | sudo tee -a /etc/sudoers.d/deploy > /dev/null
sudo chmod 440 /etc/sudoers.d/deploy

# ==========================================
# 11. PRÉPARATION SSH POUR DÉPLOIEMENT
# ==========================================
echo "🔑 Préparation SSH..."
echo "⚠️  Étapes manuelles requises :"
echo "1. Sur la machine locale, génère la clé SSH :"
echo "   ssh-keygen -t ed25519 -C 'gitlab-deploy' -f ~/.ssh/gitlab_deploy"
echo ""
echo "2. Ajoute la clé publique au VPS :"
echo "   cat ~/.ssh/gitlab_deploy.pub >> ~/.ssh/authorized_keys"
echo ""
echo "3. Sur GitLab, ajoute la clé privée :"
echo "   - Va sur: Settings → CI/CD → Variables"
echo "   - Crée SSH_PRIVATE_KEY (type: File, masked)"
echo "   - Paste le contenu de ~/.ssh/gitlab_deploy"
echo ""
echo "4. Définir les variables GitLab CI/CD :"
echo "   - VPS_HOST: <ip-ou-domaine-du-vps>"
echo "   - VPS_USER: deploy"

# ==========================================
# 12. VÉRIFICATION FINALE
# ==========================================
echo ""
echo "✅ SETUP COMPLÈTE !"
echo ""
echo "📋 Checklist post-installation :"
echo "  ☐ Enregistrer le GitLab Runner (voir étapes ci-dessus)"
echo "  ☐ Générer et ajouter la clé SSH de déploiement"
echo "  ☐ Ajouter les variables GitLab (VPS_HOST, VPS_USER, SSH_PRIVATE_KEY)"
echo "  ☐ Configurer le certificat SSL avec certbot"
echo "  ☐ Créer un fichier .env dans /var/www/parcour-admin/api/"
echo "  ☐ Faire un git push pour déclencher le premier déploiement"
echo ""
echo "🌐 Services running :"
sudo systemctl status nginx --no-pager | head -3
sudo systemctl status php8.2-fpm --no-pager | head -3
echo ""
echo "📚 Documentation : https://docs.gitlab.com/ee/ci/ci_cd_for_external_repos/"
