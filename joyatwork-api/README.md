## JoyAtWork API

JoyAtWork API est le service backend consommé par l’interface JoyAtWork Hub pour gérer les entreprises, contrats et informations métiers associées. Le projet est construit avec Laravel et expose des endpoints REST sécurisés.

---

## Stack technique

- PHP 8.x
- Laravel (version du framework à préciser)
- MySQL / MariaDB
- Composer, artisan CLI
- (Optionnel) Redis, Horizon, Scheduler, outils de queue

---

## Prérequis

- PHP >= 8.x
- Composer
- Serveur MySQL/MariaDB accessible
- Git

---

## Installation

1. Cloner le dépôt :

```bash
git clone https://github.com/Joyatwork/joyAtWork-api.git
cd joyAtWork-api
```

2. Installer les dépendances PHP :

```bash
composer install
```

3. Configurer l’environnement :

```bash
cp .env.example .env
php artisan key:generate
```

4. Renseigner les variables importantes dans `.env` :

```dotenv
APP_NAME=JoyAtWork API
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=joyatwork
DB_USERNAME=root
DB_PASSWORD=secret
```

5. Lancer les migrations (et seeds si disponibles) :

```bash
php artisan migrate
# php artisan db:seed
```

---

## Lancer l’API en local

```bash
php artisan serve
```

Par défaut l’API répond sur `http://127.0.0.1:8000`. Ajuste l’URL côté `joyatwork-hub` pour pointer vers cette instance ou vers l’environnement déployé.

---

## Tests

```bash
php artisan test
# ou
./vendor/bin/phpunit
```

Assure-toi que la base de test est configurée (`phpunit.xml` / `phpunit.xml.dist`).

---

## Relation avec joyatwork-hub

- Le frontend `joyatwork-hub` consomme les endpoints exposés ici (entreprises, contrats, authentification, etc.).
- La variable d’environnement du frontend (`VITE_API_BASE_URL`, `NEXT_PUBLIC_API_URL`, etc.) doit pointer vers l’URL publique de cette API.
- Toute évolution impactant les contrats/entreprises doit être synchronisée avec l’équipe frontend pour aligner les modèles et validations.

---

## Déploiement

1. Copier le `.env` adapté à l’environnement cible.
2. Installer les dépendances : `composer install --no-dev --optimize-autoloader`.
3. Lancer les migrations : `php artisan migrate --force`.
4. Optimiser les caches :
    ```bash
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ```
5. Configurer (si nécessaire) :
    - Cron pour `php artisan schedule:run`.
    - Workers de queue : `php artisan queue:work`.

---

## Contribution

1. Créer une branche depuis `main` (ex. `feature/ajout-contrats`).
2. Développer la fonctionnalité, ajouter/mettre à jour les tests.
3. Ouvrir une Pull Request détaillant le contexte et les impacts.

Pour toute question technique sur Laravel, se référer à la [documentation officielle](https://laravel.com/docs).
