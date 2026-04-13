# 🚀 DEPLOYMENT COMPLETE GUIDE - PARCOUR ADMIN

**Guide complet pour déployer Parcour Admin sur VPS avec GitLab CI/CD**

⏱️ Temps total estimé : **2-3 heures**

---

## 📋 TABLE DES MATIÈRES

1. [Prérequis](#prérequis)
2. [Phase 1 : VPS Setup (45 min)](#phase-1--vps-setup)
3. [Phase 2 : SSH Setup (15 min)](#phase-2--ssh-setup)
4. [Phase 3 : GitLab Variables (10 min)](#phase-3--gitlab-variables)
5. [Phase 4 : Nginx & SSL (30 min)](#phase-4--nginx--ssl)
6. [Phase 5 : GitLab Runner (15 min)](#phase-5--gitlab-runner)
7. [Phase 6 : Database & .env (15 min)](#phase-6--database--env)
8. [Phase 7 : First Deployment (5 min)](#phase-7--first-deployment)
9. [Phase 8 : Validation (5 min)](#phase-8--validation)

---

## ✅ Prérequis

- [ ] **VPS Ubuntu 22.04** avec accès SSH root
- [ ] **Domaine** pointant vers le VPS (ex: `parcouadmin.joyatwork.com`)
- [ ] **Git Bash** sur Windows (ou terminal Linux/Mac)
- [ ] **MySQL/MariaDB** installé sur le VPS

---

## PHASE 1 : VPS Setup (45 min)

### Étape 1.1 : SSH vers le VPS

```bash
ssh root@<VPS_IP>
# Remplace <VPS_IP> par l'IP réelle du VPS
# Exemple: ssh root@192.168.1.100
```

### Étape 1.2 : Cloner le repo et lancer le setup

```bash
cd /tmp
git clone https://github.com/Joyatwork/parcourAdminJoyAtWork.git
cd parcourAdminJoyAtWork

chmod +x deploy/setup-vps.sh
./deploy/setup-vps.sh
```

**⏳ Attends 30-45 minutes** while the script :
- ✅ Met à jour le système
- ✅ Installe Nginx, PHP, Node.js
- ✅ Crée l'utilisateur `deploy`
- ✅ Installe GitLab Runner
- ✅ Configure les permissions

Quand c'est fini, tu verras :
```
✨ SETUP COMPLETE! ✨
```

### Étape 1.3 : Vérifier l'installation

```bash
curl http://localhost
# Doit afficher "Welcome to nginx!"

php --version
# Doit afficher PHP 8.2

node --version
# Doit afficher v20.x.x
```

✅ **Phase 1 complétée!**

---

## PHASE 2 : SSH Setup (15 min)

> Cette phase se fait sur **ta machine locale** avec Git Bash

### Étape 2.1 : Ouvrir Git Bash sur ta machine

```bash
# Windows : Ouvre Git Bash (Start → Git Bash)
# Mac/Linux : Ouvre Terminal
```

### Étape 2.2 : Cloner le repo en local

```bash
cd ~
git clone https://github.com/Joyatwork/parcourAdminJoyAtWork.git
cd parcourAdminJoyAtWork
```

### Étape 2.3 : Générer les clés SSH

```bash
chmod +x deploy/setup-local.sh
bash deploy/setup-local.sh <VPS_IP> deploy
```

**Remplace `<VPS_IP>` par :**
- L'IP du VPS (ex: `192.168.1.100`)
- **OU** le domaine du VPS (ex: `parcouadmin.joyatwork.com`)

Exemple complet :
```bash
bash deploy/setup-local.sh 192.168.1.100 deploy
```

### Étape 2.4 : Copier la clé privée

Le script va afficher ta clé privée SSH. **COPIE TOUT LE CONTENU** (y compris `-----BEGIN` et `-----END`).

**⚠️ IMPORTANT :** Cette clé est secrète ! Ne la publie pas sur un repo public.

✅ **Phase 2 complétée!**

---

## PHASE 3 : GitLab Variables (10 min)

### Étape 3.1 : Aller sur GitLab

Visite : **https://gitlab.com/Joyatwork/parcourAdminJoyAtWork**

### Étape 3.2 : Créer les variables

Clique : **Settings → CI/CD → "Variables" → "Add variable"**

#### Variable 1 : SSH_PRIVATE_KEY
```
Key   : SSH_PRIVATE_KEY
Type  : File            ⬅️ IMPORTANT
Value : [PASTE LA CLÉ PRIVÉE COMPLÈTE D'ÉTAPE 2.4]
Masked: ✅ OUI
```

#### Variable 2 : VPS_HOST
```
Key   : VPS_HOST
Type  : Variable
Value : [L'IP OU DOMAINE DU VPS]
Masked: ⭕ NON
```

#### Variable 3 : VPS_USER
```
Key   : VPS_USER
Type  : Variable
Value : deploy
Masked: ⭕ NON
```

✅ **Phase 3 complétée!**

---

## PHASE 4 : Nginx & SSL (30 min)

> Cette phase se fait sur le **VPS** (ssh root@<VPS_IP>)

### Étape 4.1 : Configurer Nginx

```bash
sudo cp /tmp/parcourAdminJoyAtWork/deploy/nginx-parcour-admin.conf /etc/nginx/sites-available/parcour-admin
sudo ln -sf /etc/nginx/sites-available/parcour-admin /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

### Étape 4.2 : Valider la config

```bash
sudo nginx -t
# Doit afficher : "test is successful"
```

Si erreur, regarde les logs :
```bash
sudo nginx -T
```

### Étape 4.3 : Recharger Nginx

```bash
sudo systemctl reload nginx
```

### Étape 4.4 : Obtenir le certificat SSL

```bash
sudo certbot --nginx -d parcouadmin.joyatwork.com -d www.parcouadmin.joyatwork.com
```

Certbot va te demander ton mail et d'accepter les conditions. Dis "OUI" à tout.

### Étape 4.5 : Vérifier SSL

Via navigateur, visite : **https://parcouadmin.joyatwork.com**

Tu devrais voir 🔒 (cadenas) en vert dans l'URL bar.

✅ **Phase 4 complétée!**

---

## PHASE 5 : GitLab Runner (15 min)

> Cette phase se fait sur le **VPS** (ssh root@<VPS_IP>)

### Étape 5.1 : Enregistrer le Runner

```bash
sudo gitlab-runner register
```

Réponds aux questions :
```
GitLab instance URL      : https://gitlab.com/
Registration token       : [VOIR ÉTAPE 5.2]
Runner description       : VPS Production
Tags                     : production,vps
Executor                 : shell
```

### Étape 5.2 : Trouver le registration token

Va sur GitLab :
- **Settings → CI/CD → Runners**
- Copie le "Registration token"
- Reviens au terminal VPS et colle-le

### Étape 5.3 : Permissions sudo

```bash
echo "deploy ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx" | sudo tee -a /etc/sudoers.d/deploy
sudo chmod 440 /etc/sudoers.d/deploy

echo "gitlab-runner ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx" | sudo tee -a /etc/sudoers.d/gitlab-runner
sudo chmod 440 /etc/sudoers.d/gitlab-runner
```

✅ **Phase 5 complétée!**

---

## PHASE 6 : Database & .env (15 min)

> Cette phase se fait sur le **VPS** (ssh root@<VPS_IP>)

### Étape 6.1 : Créer la base de données

```bash
sudo mysql -u root -p
# Tape le mot de passe root MySQL si demandé
```

Puis dans le prompt MySQL :
```sql
CREATE DATABASE parcour_admin;
CREATE USER 'parcour_user'@'localhost' IDENTIFIED BY 'ChooseStrongPassword123!';
GRANT ALL PRIVILEGES ON parcour_admin.* TO 'parcour_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**⚠️ REMPLACE `ChooseStrongPassword123!` par un vrai mot de passe fort!**

### Étape 6.2 : Créer le fichier .env

```bash
sudo nano /var/www/parcour-admin/api/.env
```

Colle ceci (remplace le password de l'étape 6.1 et l'URL de ton domaine) :

```
APP_NAME="Parcour Admin"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://parcouadmin.joyatwork.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=parcour_admin
DB_USERNAME=parcour_user
DB_PASSWORD=ChooseStrongPassword123!

CACHE_DRIVER=file
QUEUE_CONNECTION=database
LOG_CHANNEL=single
LOG_LEVEL=error
```

Sauvegarde avec : **Ctrl+X** → **Y** → **Entrée**

✅ **Phase 6 complétée!**

---

## PHASE 7 : First Deployment (5 min)

> Cette phase se fait sur **ta machine locale**

### Étape 7.1 : Vérifier la branche

```bash
cd ~/parcourAdminJoyAtWork
git checkout dev
```

### Étape 7.2 : Trig un deploy

```bash
git add .
git commit -m "Deploy to VPS with GitLab CI/CD"
git push origin dev
```

### Étape 7.3 : Observer le pipeline

Va sur : **https://gitlab.com/Joyatwork/parcourAdminJoyAtWork/pipelines**

Tu devrais voir un nouveau pipeline avec les stages :
1. 🔨 `build:api` (3-5 min)
2. 🔨 `build:hub` (2-3 min)
3. 📤 `deploy:production` (2 min)

**Attends que tout soit 🟢 vert** (5-10 min total).

Si une étape échoue (🔴 rouge), clique dessus pour voir les erreurs.

✅ **Phase 7 complétée!**

---

## PHASE 8 : Validation (5 min)

### Étape 8.1 : Tester le frontend

Via navigateur, visite : **https://parcouadmin.joyatwork.com**

Devrait afficher le site React avec 🔒.

### Étape 8.2 : Tester l'API

```bash
curl https://parcouadmin.joyatwork.com/api
# Devrait retourner quelque chose (pas d'erreur 502)
```

### Étape 8.3 : Tester le health check

```bash
curl https://parcouadmin.joyatwork.com/health
# Devrait afficher : healthy
```

### Étape 8.4 : Vérifier les services VPS

```bash
# SSH vers le VPS
ssh deploy@<VPS_IP>

sudo systemctl status nginx        # active (running) ?
sudo systemctl status php8.2-fpm   # active (running) ?
sudo systemctl status gitlab-runner # active (running) ?
```

✅ **Tous les feux au vert ?** → **DÉPLOIEMENT RÉUSSI ! 🎉**

---

## 🆘 TROUBLESHOOTING

### ❌ SSH Connection Refused

```bash
# Tester la clé SSH manuellement
ssh -i ~/.ssh/gitlab_deploy deploy@<VPS_IP> "echo OK"
```

Si ça ne marche pas, la clé publique n'a pas été bien ajoutée au VPS.

### ❌ 502 Bad Gateway sur le site

```bash
# Sur le VPS, check les logs Nginx
sudo tail -f /var/log/nginx/parcour-admin-error.log
```

### ❌ Pipeline échoue : "File not found"

Va dans le job failed sur GitLab pour voir le log complet.

### ❌ SSL Certificate Expired

```bash
# Sur le VPS
sudo certbot renew --force-renewal
```

---

## ✅ CHECKLIST FINALE

- [ ] Phase 1 : VPS Setup complété
- [ ] Phase 2 : SSH Setup complété
- [ ] Phase 3 : GitLab Variables créées
- [ ] Phase 4 : Nginx & SSL configurés
- [ ] Phase 5 : GitLab Runner enregistré
- [ ] Phase 6 : DB & .env créés
- [ ] Phase 7 : Premier déployement lancé
- [ ] Phase 8 : Tous les tests passent ✅

---

## 🎉 FÉLICITATIONS ! 

Ton application est maintenant **en production** avec un pipeline CI/CD automatisé ! 

**Dorénavant :**
- Chaque `git push` sur `dev` déclenche automatiquement un build & déploiement
- Les logs sont visibles dans GitLab
- De rouler en HTTPS avec SSL automatique

---

## 📚 RESSOURCES

- [GitLab CI/CD Docs](https://docs.gitlab.com/ee/ci/)
- [Nginx Docs](https://nginx.org/)
- [Laravel Deployment](https://laravel.com/docs/deployment)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Good luck et bienvenue en production!** 🚀
