<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'digiflazz' => [
        'username' => env('DIGIFLAZZ_USERNAME'),
        'prod_key' => env('DIGIFLAZZ_PROD_KEY'),
    ],

    'wa_engine' => [
        'url' => env('WA_ENGINE_URL', 'http://localhost:3000'),
        'api_key' => env('WA_ENGINE_API_KEY'),
        'max_devices' => env('WA_ENGINE_MAX_DEVICES', 5),
        'max_messages_per_minute' => env('WA_ENGINE_MAX_MESSAGES_PER_MINUTE', 20),
    ],

];
