<?php

return [

    'paths' => ['*'], // 🔥 IMPORTANT pour Sanctum

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://parcour-admin-joy-at-work.vercel.app',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];