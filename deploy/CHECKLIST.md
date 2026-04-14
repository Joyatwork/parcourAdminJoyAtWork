# ✅ GitLab CI/CD Deployment Checklist

## 🎯 Objectif
Déployer Parcour Admin (Laravel API + React Hub) sur VPS via GitLab CI/CD avec Nginx reverse proxy et SSL.

---

## PHASE 1️⃣ - Préparation du VPS (1-2h)

### Infrastructure & Domaine
- [ ] **VPS provisionné** : Ubuntu 22.04 (2 vCPU, 2 Go RAM minimum)
- [ ] **Domaine configuré** : À quoi pointe `parcouadmin.joyatwork.com` ?
  - Mettre à jour le DNS si nécessaire
  - Vérifier : `nslookup parcouadmin.joyatwork.com` ou `ping <VPS_IP>`

### Setup automatique (Recommandé)
- [ ] **SSH accès root au VPS** : Tu peux te connecter avec `ssh root@<VPS_IP>` ?
- [ ] **Cloner le repo sur VPS** :
  ```bash
  cd /tmp && git clone https://gitlab.com/Joyatwork/parcourAdminJoyAtWork.git
  cd parcourAdminJoyAtWork
  ```
- [ ] **Exécuter le script setup** :
  ```bash
  chmod +x deploy/setup-vps.sh
  sudo ./deploy/setup-vps.sh
  ```
- [ ] **Vérifier l'installation** :
  ```bash
  sudo systemctl status nginx
  sudo systemctl status php8.2-fpm
  ```

**Alternative (Manuel)** : Voir `deploy/README.md` section "Option B"

---

## PHASE 2️⃣ - Configuration SSH pour Déploiement (30-45 min)

### Sur ta machine locale

#### Générer la clé SSH
```bash
ssh-keygen -t ed25519 -C 'gitlab-deploy' -f ~/.ssh/gitlab_deploy
# Appuyer sur Entrée 2x (pas de passphrase)
```

- [ ] Clé privée générée : `~/.ssh/gitlab_deploy`
- [ ] Clé publique générée : `~/.ssh/gitlab_deploy.pub`

#### Ajouter la clé au VPS
```bash
cat ~/.ssh/gitlab_deploy.pub | ssh deploy@<VPS_IP> "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

#### Tester la connexion
```bash
ssh -i ~/.ssh/gitlab_deploy deploy@<VPS_IP> "echo 'SSH OK!'"
# Devrait afficher "SSH OK!" sans demander de mot de passe
```

- [ ] Connexion SSH testée ✅

---

## PHASE 3️⃣ - Configuration GitLab (15-20 min)

### Variables CI/CD

Va sur : **https://gitlab.com/Joyatwork/parcourAdminJoyAtWork → Settings → CI/CD → Variables**

Crée ces 3 variables :

#### 1. SSH_PRIVATE_KEY (Type: File, Masked)
```bash
# Sur ta machine locale :
cat ~/.ssh/gitlab_deploy
# Copy/paste le contenu COMPLET (incluant -----BEGIN et -----END)
```

- [ ] Variable `SSH_PRIVATE_KEY` créée (type: File, masked)

#### 2. VPS_HOST (Type: Variable)
- [ ] Variable `VPS_HOST` = `<IP_OU_DOMAINE_VPS>` (ex: `134.56.78.90` ou `parcouadmin.joyatwork.com`)

#### 3. VPS_USER (Type: Variable)
- [ ] Variable `VPS_USER` = `deploy`

**Vérification :**
```
GitLab → Settings → CI/CD → Variables
Devrait afficher :
- SSH_PRIVATE_KEY ••••••• (masked)
- VPS_HOST    <ta-valeur>
- VPS_USER    deploy
```

---

## PHASE 4️⃣ - Configuration Nginx & SSL (20-30 min)

### Copier la config Nginx

**Sur le VPS** (en tant qu'utilisateur `deploy` ou `root`) :
```bash
sudo cp /tmp/parcourAdminJoyAtWork/deploy/nginx-parcour-admin.conf /etc/nginx/sites-available/parcour-admin
sudo ln -sf /etc/nginx/sites-available/parcour-admin /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Vérifier la config
sudo nginx -t

# Recharger
sudo systemctl reload nginx
```

- [ ] Config Nginx déployée et testée (`sudo nginx -t` OK)

### Obtenir le certificat SSL

```bash
sudo certbot --nginx -d parcouadmin.joyatwork.com -d www.parcouadmin.joyatwork.com
# Certbot va interagir et générer automatiquement la config SSL
```

- [ ] Certificat SSL obtenu avec Certbot
- [ ] Test SSL : https://parcouadmin.joyatwork.com (🔒 HTTPS OK ?)

---

## PHASE 5️⃣ - GitLab Runner (15-30 min)

### Installation & Enregistrement

**Sur le VPS** :
```bash
# Installation
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt-get install -y gitlab-runner
sudo systemctl start gitlab-runner

# Enregistrement
sudo gitlab-runner register
```

**Lors de la saisie interactive :**
```
GitLab instance URL: https://gitlab.com/
Registration token: <Voir GitLab → Settings → CI/CD → Runners → Registration token>
Runner description: VPS Production Runner
Tags: production,vps
Executor: shell
```

- [ ] GitLab Runner enregistré et running

### Permissions sudo

```bash
echo "deploy ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx" | sudo tee -a /etc/sudoers.d/deploy
sudo chmod 440 /etc/sudoers.d/deploy
```

- [ ] Permissions sudo configurées pour Nginx reload

---

## PHASE 6️⃣ - Base de données & Environnement (15-20 min)

### Créer la base de données

**Sur le VPS** :
```bash
sudo mysql -u root -p

CREATE DATABASE parcour_admin;
CREATE USER 'parcour_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON parcour_admin.* TO 'parcour_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

- [ ] Base de données `parcour_admin` créée
- [ ] Utilisateur `parcour_user` créé avec password sécurisé

### Créer le fichier .env

**Sur le VPS**, créer `/var/www/parcour-admin/api/.env` :

```bash
sudo tee /var/www/parcour-admin/api/.env > /dev/null <<EOF
APP_NAME="Parcour Admin"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://parcouadmin.joyatwork.com
APP_KEY=base64:... # Sera complété lors du premier déploiement

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=parcour_admin
DB_USERNAME=parcour_user
DB_PASSWORD=YOUR_STRONG_PASSWORD

CACHE_DRIVER=file
QUEUE_CONNECTION=database
LOG_CHANNEL=single
LOG_LEVEL=error
EOF
```

- [ ] Fichier `.env` créé avec configs correctes

---

## PHASE 7️⃣ - Premier Déploiement (5-10 min)

### Sur ta machine locale

```bash
cd /chemin/vers/parcourAdminJoyAtWork

# S'assurer d'être sur la branche dev
git checkout dev

# Faire un push pour déclencher le pipeline
git add .
git commit -m "Trigger GitLab CI/CD pipeline"
git push origin dev
```

- [ ] Push effectué sur la branche `dev`

### Observer le pipeline

Va sur : **https://gitlab.com/Joyatwork/parcourAdminJoyAtWork → CI/CD → Pipelines**

Clique sur ton commit pour voir les stages :
1. **build:api** - Build du backend Laravel
2. **build:hub** - Build du frontend React  
3. **test:api** - Tests (optionnel)
4. **deploy:production** - Déploiement sur VPS

- [ ] Stage `build:api` ✅ (vert)
- [ ] Stage `build:hub` ✅ (vert)
- [ ] Stage `deploy:production` ✅ (vert)

**Si une étape échoue**, clique dessus pour voir les logs d'erreur.

---

## PHASE 8️⃣ - Validation (10 min)

### Vérifier que tout est en place

```bash
# Accès frontend
curl -I https://parcouadmin.joyatwork.com
# Doit retourner HTTP 200

# Accès API
curl -I https://parcouadmin.joyatwork.com/api
# Doit retourner HTTP 404 ou 200 (API OK)

# Health check
curl https://parcouadmin.joyatwork.com/health
# Doit répondre "healthy"
```

À partir du navigateur :
- [ ] Frontend accessible : https://parcouadmin.joyatwork.com
- [ ] API accessible : https://parcouadmin.joyatwork.com/api (ou voir les endpoints)
- [ ] SSL valide 🔒 (certificat visible dans le navigateur)

### Vérifier les services sur le VPS

```bash
sudo systemctl status nginx     # Doit être "active (running)"
sudo systemctl status php8.2-fpm # Doit être "active (running)"
sudo systemctl status gitlab-runner # Doit être "active (running)"
```

- [ ] Nginx running ✅
- [ ] PHP-FPM running ✅
- [ ] GitLab Runner running ✅

---

## 🎉 Déploiement réussi !

Si toutes les cases sont cochées ⬆️, c'est BON !

**Récapitulatif :**
- ✅ VPS configuré avec Nginx, PHP, Node.js
- ✅ Déploiement automatisé via GitLab CI/CD
- ✅ SSL/TLS avec Let's Encrypt
- ✅ Base de données prête
- ✅ Pipeline testé et fonctionnel

---

## 📖 Prochaines étapes

### Déploiements futurs
- Tout nouveau `push` sur la branche `dev` déclenche automatiquement le pipeline
- Les logs du déploiement sont visibles dans GitLab

### Maintenance
- [ ] Renouvellement auto SSL via Certbot (cron daily)
- [ ] Configurer les notifications GitLab (email, Slack, etc.)
- [ ] Configurer des backups réguliers du VPS
- [ ] Ajouter des smoke tests post-déploiement
- [ ] Documenter les variables d'environnement sensibles

### Troubleshooting
Consulte `deploy/README.md` pour la section "Troubleshooting" si des problèmes surviennent.

---

## 📞 Questions / Support

- **Erreur SSH ?** → Voir `deploy/README.md` "SSH connection refused"
- **502 Bad Gateway ?** → Voir logs Nginx : `sudo tail -f /var/log/nginx/parcour-admin-error.log`
- **SSL expired ?** → Run `sudo certbot renew`

---

**Statut complet** : ⏳ En cours / ✅ Complété
