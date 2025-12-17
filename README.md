## Parcours Admin JoyAtWork

Ce dépôt `parcoursAdminJoyAtWork` est un **monorepo** qui regroupe :

- `joyatwork-api` : API backend Laravel pour gérer les entreprises, contrats et données métier associées.
- `joyatwork-hub` : application frontend (React / Vite / TypeScript) qui consomme l’API JoyAtWork.

L’objectif est de centraliser dans un seul projet tout ce qui concerne le parcours administrateur JoyAtWork.

---

### 1. Prérequis

**Commun**

- Git
- Accès à un serveur MySQL / MariaDB

**Backend (`joyatwork-api`)**

- PHP ≥ 8.x
- Composer
- (Optionnel) Redis / système de queue selon les fonctionnalités activées

**Frontend (`joyatwork-hub`)**

- Node.js (version LTS recommandée) ou Bun
- npm / pnpm / bun (selon votre outil préféré)

---

### 2. Gestion des fichiers d’environnement

Les fichiers d’environnement contiennent des **secrets** (mots de passe, clés, URLs internes, etc.).  
Par conséquent :

- **Ne jamais committer** de fichiers `.env` dans le dépôt.
- L’owner du projet fournira aux contributeurs un **fichier d’environnement à coller** dans leur projet local (par ex. contenu de `.env` pour l’API et `.env` / `.env.local` pour le frontend).
- Un fichier `.env.example` peut être utilisé pour **documenter les variables obligatoires** sans les valeurs sensibles.

En résumé :

1. Récupérez le contenu de `.env` (fourni par l’owner).
2. Créez un fichier `.env` correspondant dans `joyatwork-api` et/ou `joyatwork-hub`.
3. Ne les poussez jamais vers Git.

---

### 3. Backend : installation et lancement de `joyatwork-api`

1. Se placer dans le dossier backend :

   ```bash
   cd joyatwork-api
   ```

2. Installer les dépendances PHP :

   ```bash
   composer install
   ```

3. Créer et remplir le fichier `.env` :
   - Créez un fichier `.env` à la racine de `joyatwork-api`.
   - Collez le contenu fourni par l’owner du projet.
   - Si aucune clé d’application n’est définie (`APP_KEY` vide), générez-la :

     ```bash
     php artisan key:generate
     ```

4. Vérifier / ajuster la configuration base de données dans `.env` :

   Exemple :

   ```dotenv
   APP_ENV=local
   APP_DEBUG=true
   APP_URL=http://127.0.0.1:8000

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=joyatwork
   DB_USERNAME=votre_utilisateur
   DB_PASSWORD=votre_mot_de_passe
   ```

5. Lancer les migrations (et seeders si nécessaire) :

   ```bash
   php artisan migrate
   # php artisan db:seed   # si des seeders sont configurés
   ```

6. Démarrer l’API en local :

   ```bash
   php artisan serve
   ```

   Par défaut, l’API sera accessible sur `http://127.0.0.1:8000`.

---

### 4. Frontend : installation et lancement de `joyatwork-hub`

1. Se placer dans le dossier frontend :

   ```bash
   cd joyatwork-hub
   ```

2. Installer les dépendances :

   ```bash
   npm install
   # ou
   # bun install
   ```

3. Créer et remplir le fichier d’environnement frontend :
   - Créez un fichier `.env` ou `.env.local` dans `joyatwork-hub`.
   - Collez le contenu fourni par l’owner.
   - Vérifiez que la variable qui pointe vers l’API (par ex. `VITE_API_BASE_URL`) est correcte, par exemple :

     ```dotenv
     VITE_API_BASE_URL=http://127.0.0.1:8000
     ```

4. Lancer le serveur de développement :

   ```bash
   npm run dev
   ```

   L’URL locale (par ex. `http://localhost:5173`) sera affichée dans la console.

---

### 5. Structure du dépôt

**Racine**

- `joyatwork-api/` : code source de l’API Laravel JoyAtWork.
- `joyatwork-hub/` : code source de l’interface administrateur JoyAtWork.

**Backend : `joyatwork-api/` (principaux dossiers)**

- `app/Http/Controllers` : contrôleurs Laravel, exposent les endpoints API.
- `app/Models` : modèles Eloquent représentant les entités métier (entreprises, contrats, etc.).
- `config/` : configuration de l’application (base de données, mail, cache, services, etc.).
- `database/migrations` : migrations pour créer / modifier la structure de la base de données.
- `database/seeders` : seeders pour insérer des données initiales.
- `routes/api.php` : définition des routes d’API consommées par `joyatwork-hub`.
- `tests/` : tests automatisés (PHPUnit / Artisan).

**Frontend : `joyatwork-hub/` (principaux dossiers)**

- `src/components` : composants réutilisables et éléments d’interface (dashboards, formulaires, etc.).
- `src/pages` : pages principales (entreprises, contrats, praticiens, tableaux de bord, etc.).
- `src/hooks` : hooks personnalisés (ex. `useApi`, `useCompanies`, `useContracts`).
- `src/lib` : fonctions utilitaires, helpers d’API.
- `public/` : ressources statiques (favicon, images, etc.).
- Fichiers de config : Vite, Tailwind, TypeScript, ESLint, etc.

---

### 6. Stratégie de branches Git

La branche de travail principale est **`dev`**.  
Toutes les contributions doivent partir de cette branche.

#### 6.1 Cloner le dépôt et récupérer `dev`

1. Cloner le dépôt (en lecture seule ou avec accès écriture) :

   ```bash
   git clone https://github.com/<ORGANISATION>/parcoursAdminJoyAtWork.git
   cd parcoursAdminJoyAtWork
   ```

2. Récupérer toutes les branches distantes et se placer sur `dev` :

   ```bash
   git fetch origin
   git checkout dev
   ```

3. S’assurer que `dev` est bien à jour avant de commencer à travailler :

   ```bash
   git pull origin dev
   ```

> À partir de là, considérez **`dev` comme votre branche locale de base**. Toutes vos branches de feature doivent être créées à partir de `dev`.

#### 6.2 Créer des branches de travail depuis `dev`

- **Branches de travail**
  - Créez toujours vos branches depuis `dev` :
    - `feature/nom-fonctionnalite` pour une nouvelle fonctionnalité.
    - `fix/nom-correctif` pour un bugfix.
  - Exemple :

    ```bash
    git checkout dev
    git pull origin dev
    git checkout -b feature/ajout-gestion-contrats
    ```

- **Commits**
  - Préférez des commits courts et explicites, par exemple :
    - `feat(api): ajout endpoint création entreprise`
    - `fix(hub): correction affichage liste contrats`

- **Intégration**
  - Poussez votre branche sur le dépôt distant :

    ```bash
    git push origin feature/ajout-gestion-contrats
    ```

  - Ouvrez une **Pull Request vers `dev`**.
  - Après validation et tests, `dev` pourra être fusionnée vers une branche de release ou `main` (selon le workflow décidé par le product owner).

---

### 7. Bonnes pratiques pour les migrations (Laravel)

Pour garantir une base de données cohérente entre tous les environnements, suivez ces étapes lorsqu’une **nouvelle migration** est nécessaire :

1. **Mettre à jour votre branche `dev` locale**

   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Créer une branche de feature depuis `dev`**

   ```bash
   git checkout -b feature/ajout-champ-contrat
   ```

3. **Créer une nouvelle migration**

   Utilisez les commandes Artisan, par exemple :

   ```bash
   php artisan make:migration add_new_field_to_contracts_table
   ```

   - Le fichier sera créé dans `database/migrations`.
   - Éditez la méthode `up()` / `down()` pour décrire précisément les changements (ajout de colonne, création de table, etc.).

4. **Appliquer la migration en local**

   ```bash
   php artisan migrate
   ```

   - Vérifiez que la base de données est dans l’état attendu.
   - Mettez à jour si besoin les seeders et/ou les données de test.

5. **Règle importante : ne pas modifier une migration déjà appliquée en production**
   - Si une migration a déjà été exécutée sur un environnement partagé (staging / prod), **ne la modifiez pas**.
   - Créez **une nouvelle migration** pour corriger ou étendre la structure.

6. **Commits et Pull Request**
   - Commitez la migration, le modèle, les contrôleurs, tests, etc. sur votre branche `feature/...`.
   - Poussez la branche et ouvrez une **Pull Request vers `dev`**.
   - Décrivez clairement :
     - Les changements de schéma (tables, colonnes, index).
     - Les impacts sur l’API et le frontend.

7. **Déploiement (staging / production)**
   - Après merge de la branche dans `dev`, puis dans la branche de déploiement :
     - Déployer le code.
     - Exécuter les migrations sur le serveur :

       ```bash
       php artisan migrate --force
       ```

   - Vérifier les journaux et le bon fonctionnement des endpoints concernés.

---

### 8. Règles de collaboration

- **Ne pas committer** :
  - `node_modules`, `vendor`, `dist`, `storage`, `bootstrap/cache`, fichiers `.env`, etc.
- **Respecter la stratégie de branches** basée sur `dev`.
- **Documenter les changements API** :
  - Si un endpoint change, synchroniser avec l’équipe frontend et mettre à jour les appels dans `joyatwork-hub`.
- **Pull Requests**
  - Décrire le contexte, les changements, et les impacts possibles.
  - Ajouter si possible :
    - Exemples de requêtes / réponses API.
    - Captures d’écran pour les changements frontend.
