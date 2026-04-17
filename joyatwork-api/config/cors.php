<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Laravel CORS Configuration
    |--------------------------------------------------------------------------
    */

    // ✅ CHEMINS EXPLICITES (OBLIGATOIRE)
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
    ],

    'allowed_methods' => ['*'],

    // ✅ ORIGINE FIXE (Vercel)
    'allowed_origins' => [
        'https://parcour-admin-joy-at-work.vercel.app',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // ✅ OBLIGATOIRE AVEC SANCTUM
    'supports_credentials' => true,

];