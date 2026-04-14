# 🚀 GitLab CI/CD Deployment - Parcour Admin

Guide complet de déploiement de Parcour Admin sur VPS avec **GitLab CI/CD**, **Nginx** reverse proxy et **Let's Encrypt SSL**.

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  DÉVELOPPEUR                                                 │
│  git push dev → GitHub / GitLab                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  GitLab CI/CD PIPELINE                                       │
│  1. Build (Node + PHP)                                       │
│  2. Test (optionnel)                                         │
│  3. Deploy (rsync + SSH)                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  VPS (Ubuntu 22.04)                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ NGINX (Reverse Proxy)                    :80, :443     │ │
│  │ ├─ /api/* → Laravel API :8000            (SSL)         │ │
│  │ ├─ /* → React Hub (dist/)                             │ │
│  │ └─ /health → Status check                            │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ PHP-FPM 8.2 + Laravel API   :8000                      │ │
│  │ Node.js + React Build       (Static Hub)               │ │
│  │ MariaDB / MySQL             (Base de données)          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Prérequis

- **VPS Ubuntu 22.04** : 2 vCPU, 2 Go RAM minimum
- **Domaine** : `parcouadmin.joyatwork.com` (pointant vers l'IP du VPS)
- **GitLab Repository** : Push access
- **Clé SSH** : Paire ED25519 pour l'authentification au VPS

## 📋 Étapes d'installation

### 1️⃣ Préparer le VPS

#### Option A : Utiliser le script automatique (Recommandé)

```bash
# Sur ton VPS, clone le repo et lance le script :
cd /tmp
git clone https://gitlab.com/Joyatwork/parcourAdminJoyAtWork.git
cd parcourAdminJoyAtWork

# Lance le setup (demande sudo password)
chmod +x deploy/setup-vps.sh
./deploy/setup-vps.sh
```

#### Option B : Installation manuelle

```bash
# 1. System update
sudo apt-get update && sudo apt-get upgrade -y

# 2. Installer Nginx, PHP, Node.js
sudo apt-get install -y nginx php8.2-cli php8.2-fpm php8.2-pdo php8.2-mysql php8.2-zip
sudo apt-get install -y nodejs npm

# 3. Créer l'utilisateur de déploiement
sudo useradd -m -s /bin/bash deploy
sudo mkdir -p /home/deploy/.ssh && sudo chmod 700 /home/deploy/.ssh

# 4. Créer la structure d'application
sudo mkdir -p /var/www/parcour-admin/{api,hub,logs}
sudo chown -R deploy:www-data /var/www/parcour-admin

# 5. Installer Certbot
sudo apt-get install -y certbot python3-certbot-nginx
```

### 2️⃣ Configurer SSH pour le déploiement

#### Générer la clé SSH (sur ta machine locale)

```bash
ssh-keygen -t ed25519 -C 'gitlab-deploy' -f ~/.ssh/gitlab_deploy
# Pas de passphrase (laisser vide)
```

#### Ajouter la clé publique au VPS

```bash
# Copie la clé publique
cat ~/.ssh/gitlab_deploy.pub

# Sur le VPS, en tant qu'utilisateur deploy :
echo "paste_la_clé_publique_ici" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Teste la connexion
ssh -i ~/.ssh/gitlab_deploy deploy@<IP-VPS> "echo 'SSH OK!'"
```

### 3️⃣ Configurer GitLab CI/CD

#### Ajouter les variables secrètes

Va sur : **GitLab → Settings → CI/CD → Variables**

Crée ces variables :

| Variable | Type | Valeur | Masked |
|----------|------|--------|--------|
| `SSH_PRIVATE_KEY` | File | Contenu de `~/.ssh/gitlab_deploy` | ✅ |
| `VPS_HOST` | Variable | IP ou domaine du VPS | ⭕ |
| `VPS_USER` | Variable | `deploy` | ⭕ |

**Pour ajouter SSH_PRIVATE_KEY :**
```bash
cat ~/.ssh/gitlab_deploy | xclip -selection clipboard
# Puis paste dans GitLab CI/CD Variables (type: File)
```

### 4️⃣ Configurer Nginx et SSL

#### Copier la configuration Nginx

```bash
sudo cp deploy/nginx-parcour-admin.conf /etc/nginx/sites-available/parcour-admin
sudo ln -sf /etc/nginx/sites-available/parcour-admin /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Valider la config
sudo nginx -t

# Recharger
sudo systemctl reload nginx
```

#### Obtenir un certificat SSL avec Certbot

```bash
sudo certbot --nginx -d parcouadmin.joyatwork.com -d www.parcouadmin.joyatwork.com

# Certbot modifie automatiquement la config Nginx
# Teste : https://parcouadmin.joyatwork.com (devrait avoir 🔒 SSL)
```

### 5️⃣ Installer et enregistrer GitLab Runner

```bash
# Installation
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt-get install -y gitlab-runner

# Enregistrement
sudo gitlab-runner register
```

Lors de l'enregistrement, renseigner :
- **URL** : `https://gitlab.com/`
- **Token** : Copier depuis GitLab → Settings → CI/CD → Runners
- **Description** : `VPS Production Runner`
- **Tags** : `production,vps`
- **Executor** : `shell`

### 6️⃣ Configurer les permissions sudo

Le Runner doit pouvoir recharger Nginx :

```bash
echo "deploy ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx" | sudo tee -a /etc/sudoers.d/deploy
echo "gitlab-runner ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx" | sudo tee -a /etc/sudoers.d/gitlab-runner
sudo chmod 440 /etc/sudoers.d/deploy /etc/sudoers.d/gitlab-runner
```

### 7️⃣ Préparer la base de données

```bash
# Créer la BD MySQL/MariaDB sur le VPS
sudo mysql -u root -p

CREATE DATABASE parcour_admin;
CREATE USER 'parcour_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON parcour_admin.* TO 'parcour_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Puis, créer un **fichier `.env`** sur le VPS :

```bash
sudo tee /var/www/parcour-admin/api/.env > /dev/null <<EOF
APP_NAME="Parcour Admin"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://parcouadmin.joyatwork.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=parcour_admin
DB_USERNAME=parcour_user
DB_PASSWORD=strong_password_here

CACHE_DRIVER=file
QUEUE_CONNECTION=database

LOG_CHANNEL=single
LOG_LEVEL=error
EOF
```

### 8️⃣ Premier déploiement

```bash
# En local, sur la branche dev
git add .
git commit -m "Add GitLab CI/CD pipeline and VPS setup"
git push origin dev

# GitLab déclenche automatiquement le pipeline
# Observe les logs dans : GitLab → CI/CD → Pipelines
```

## 📊 Monitoring et Logs

### Voir les logs du pipeline GitLab

```
GitLab → CI/CD → Pipelines → [Ton commit] → [Stage]
```

### Sur le VPS

```bash
# Logs Nginx
sudo tail -f /var/log/nginx/parcour-admin-error.log
sudo tail -f /var/log/nginx/parcour-admin-access.log

# Logs Laravel
tail -f /var/www/parcour-admin/api/storage/logs/laravel.log

# Status services
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status gitlab-runner
```

### Health check

```bash
# Depuis n'importe où :
curl https://parcouadmin.joyatwork.com/health

# Réponse attendue :
# healthy
```

## 🐛 Troubleshooting

### ❌ Pipeline fails : SSH connection refused

**Solution :**
```bash
# Vérifie que la clé SSH est bien ajoutée au VPS
ssh -i ~/.ssh/gitlab_deploy deploy@<VPS_IP> "pwd"

# Ajoute la clé publique manuellement si nécessaire
cat ~/.ssh/gitlab_deploy.pub | ssh deploy@<VPS_IP> "cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

### ❌ Nginx shows 502 Bad Gateway

**Solution :**
```bash
# Vérifie que l'API Laravel est en cours d'exécution
sudo ps aux | grep "php artisan serve"

# Redémarre les services
sudo systemctl restart php8.2-fpm
sudo systemctl reload nginx

# Check logs
sudo tail -f /var/log/nginx/parcour-admin-error.log
```

### ❌ SSL certificate not found

**Solution :**
```bash
# Rerun Certbot
sudo certbot --nginx -d parcouadmin.joyatwork.com

# Force renewal if expiring
sudo certbot renew --force-renewal
```

### ❌ rsync : permission denied

**Solution :**
```bash
# Assure-toi que l'utilisateur 'deploy' a les droits
sudo chown -R deploy:www-data /var/www/parcour-admin
sudo chmod -R 775 /var/www/parcour-admin
```

## 🔄 Rollback d'urgence

Si un déploiement échoue :

```bash
# Sur le VPS :
cd /var/www/parcour-admin/api
git log --oneline
git checkout <commit-hash>  # Revenir à une version antérieure
sudo systemctl reload nginx
```

## 📚 Ressources

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Nginx Reverse Proxy Guide](https://nginx.org/en/docs/)
- [Let's Encrypt / Certbot](https://certbot.eff.org/)
- [Laravel Deployment](https://laravel.com/docs/deployment)

## 💬 Support

Pour des questions, ouvre une issue sur le repo GitLab.

---

**Dernière mise à jour** : 2026-04-13  
**Maintenu par** : Joyatwork Dev Team
