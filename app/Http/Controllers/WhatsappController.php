<?php

namespace App\Http\Controllers;

use App\Models\Whatsapp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class WhatsappController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index() {
        return Inertia::render('Admin/Whatsapp/Index');
    }    

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Whatsapp $whatsapp)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Whatsapp $whatsapp)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Whatsapp $whatsapp)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Whatsapp $whatsapp)
    {
        //
    }

    private $waEngineUrl;
    
    public function __construct()
    {
        // URL WA Engine API - bisa dari config atau .env
        $this->waEngineUrl = config('services.wa_engine.url', 'http://localhost:3000');
    }
       
    
    public function getDevices()
    {
        try {
            $response = Http::timeout(10)->get("{$this->waEngineUrl}/api/devices");
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch devices from WA Engine',
                'devices' => []
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'devices' => []
            ], 500);
        }
    }
    
    public function addDevice(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100'
        ]);
        
        try {
            $response = Http::timeout(15)->post("{$this->waEngineUrl}/api/device/add", [
                'name' => $request->name
            ]);
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to add device'
            ], 400);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function deleteDevice($deviceId)
    {
        try {
            $response = Http::delete("{$this->waEngineUrl}/api/device/{$deviceId}");
            
            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Device deleted successfully'
                ]);
            }
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete device'
            ], 400);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function sendMessage(Request $request)
    {
        $request->validate([
            'device_id' => 'required|string',
            'target' => 'required|string|regex:/^[0-9]+$/',
            'message' => 'required|string|max:4096',
            'delay' => 'integer|min:500|max:10000'
        ]);
        
        try {
            // Format target number
            $target = $this->formatPhoneNumber($request->target);
            
            $response = Http::timeout(30)->post("{$this->waEngineUrl}/api/send-message", [
                'device_id' => $request->device_id,
                'target' => $target,
                'message' => $request->message,
                'delay' => $request->delay ?? 2000
            ]);
            
            if ($response->successful()) {
                // Log the message in database if needed
                $this->logMessage([
                    'device_id' => $request->device_id,
                    'target' => $target,
                    'message' => $request->message,
                    'status' => 'queued'
                ]);
                
                return response()->json($response->json());
            }
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to send message'
            ], 400);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function sendBulk(Request $request)
    {
        $request->validate([
            'device_id' => 'required|string',
            'targets' => 'required|array|min:1',
            'targets.*' => 'string|regex:/^[0-9]+$/',
            'message' => 'required|string|max:4096'
        ]);
        
        try {
            $formattedTargets = array_map([$this, 'formatPhoneNumber'], $request->targets);
            
            $response = Http::timeout(60)->post("{$this->waEngineUrl}/api/send-bulk", [
                'device_id' => $request->device_id,
                'targets' => $formattedTargets,
                'message' => $request->message
            ]);
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to send bulk messages'
            ], 400);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function getStats()
    {
        try {
            $response = Http::get("{$this->waEngineUrl}/api/stats");
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json([
                'success' => false,
                'stats' => $this->getDefaultStats()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'stats' => $this->getDefaultStats()
            ]);
        }
    }
    
    public function downloadSource()
    {
        // Create ZIP package for WA Engine
        $zipPath = $this->createWaEnginePackage();
        
        if ($zipPath) {
            return response()->download($zipPath, 'wa-engine-ppob.zip')
                ->deleteFileAfterSend(true);
        }
        
        return response()->json([
            'success' => false,
            'error' => 'Failed to create package'
        ], 500);
    }
    
    private function formatPhoneNumber($number)
    {
        $cleaned = preg_replace('/[^0-9]/', '', $number);
        
        // Jika diawali 0, ganti dengan 62
        if (str_starts_with($cleaned, '0')) {
            $cleaned = '62' . substr($cleaned, 1);
        }
        // Jika diawali 62, biarkan
        elseif (!str_starts_with($cleaned, '62')) {
            $cleaned = '62' . $cleaned;
        }
        
        return $cleaned;
    }
    
    private function getDefaultStats()
    {
        return [
            'totalSent' => 0,
            'totalFailed' => 0,
            'totalDevices' => 0,
            'activeDevices' => 0,
            'queueSize' => 0,
            'successRate' => 0
        ];
    }
    
    private function logMessage($data)
    {
        // Store message log in database
        // You can create a Model for this
        Cache::put('wa_message_log_' . uniqid(), $data, now()->addDays(30));
    }
    
    private function createWaEnginePackage()
    {
        $packageFiles = [
            'server.js' => $this->getServerJsContent(),
            'package.json' => $this->getPackageJsonContent(),
            'ecosystem.config.js' => $this->getEcosystemConfigContent(),
            'README.md' => $this->getReadmeContent(),
            '.env.example' => $this->getEnvExampleContent()
        ];
        
        // Create temporary directory
        $tempDir = storage_path('app/temp/wa-engine-' . time());
        mkdir($tempDir, 0755, true);
        
        // Create files
        foreach ($packageFiles as $filename => $content) {
            file_put_contents("{$tempDir}/{$filename}", $content);
        }
        
        // Create ZIP
        $zipFile = storage_path("app/wa-engine-ppob.zip");
        $zip = new \ZipArchive();
        
        if ($zip->open($zipFile, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === TRUE) {
            foreach ($packageFiles as $filename => $content) {
                $zip->addFile("{$tempDir}/{$filename}", $filename);
            }
            
            // Add directories
            $zip->addEmptyDir('config');
            $zip->addEmptyDir('sessions');
            $zip->addEmptyDir('logs');
            
            $zip->close();
        }
        
        // Cleanup temp directory
        array_map('unlink', glob("{$tempDir}/*.*"));
        rmdir($tempDir);
        
        return $zipFile;
    }
    
    private function getServerJsContent()
    {
        return file_get_contents(__DIR__ . '/../../wa-engine/server.js');
    }
    
    // private function getPackageJsonContent()
    // {
    //     return json_encode([
    //         "name" => "wa-engine-ppob",
    //         "version" => "1.0.0",
    //         "description" => "WhatsApp Engine for PPOB System",
    //         "main" => "server.js",
    //         "scripts" => {
    //             "start": "node server.js",
    //             "dev": "nodemon server.js",
    //             "pm2": "pm2 start ecosystem.config.js",
    //             "clean": "rm -rf sessions/*"
    //         },
    //         "dependencies": {
    //             "@whiskeysockets/baileys": "^6.7.8",
    //             "express": "^4.18.2",
    //             "cors": "^2.8.5",
    //             "pino": "^8.19.0",
    //             "qrcode-terminal": "^0.12.0",
    //             "axios": "^1.6.0"
    //         },
    //         "devDependencies": {
    //             "nodemon": "^3.0.3"
    //         },
    //         "engines": {
    //             "node": ">=18.0.0"
    //         }
    //     ], JSON_PRETTY_PRINT);
    // }
    
    private function getEcosystemConfigContent()
    {
        return `module.exports = {
  apps: [{
    name: "wa-engine-ppob",
    script: "server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      PPOB_API_URL: "${env('APP_URL')}",
      PPOB_API_KEY: "${env('WA_ENGINE_API_KEY')}",
      MAX_DEVICES: 5,
      MAX_MESSAGES_PER_MINUTE: 20
    },
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    log_file: "logs/combined.log",
    time: true
  }]
};`;
    }
    
//     private function getReadmeContent()
//     {
//         return `# WhatsApp Engine for PPOB System

// ## 🚀 Quick Start

// 1. Install dependencies:
// \`\`\`bash
// npm install
// \`\`\`

// 2. Configure environment:
// \`\`\`bash
// cp .env.example .env
// # Edit .env file with your settings
// \`\`\`

// 3. Start the engine:
// \`\`\`bash
// # Development
// npm run dev

// # Production with PM2
// npm run pm2
// \`\`\`

// ## 📡 API Integration with Laravel PPOB

// ### 1. Update Laravel .env:
// \`\`\`env
// WA_ENGINE_URL=http://localhost:3000
// WA_ENGINE_API_KEY=your-secret-key
// \`\`\`

// ### 2. Add to config/services.php:
// \`\`\`php
// 'wa_engine' => [
//     'url' => env('WA_ENGINE_URL'),
//     'api_key' => env('WA_ENGINE_API_KEY'),
// ],
// \`\`\`

// ### 3. Use in Laravel Controllers:
// \`\`\`php
// // Send transaction notification
// public function sendNotification($userId, $message)
// {
//     $user = User::find($userId);
    
//     Http::post(config('services.wa_engine.url') . '/api/send-message', [
//         'device_id' => 'device_001',
//         'target' => $user->phone,
//         'message' => $message,
//         'delay' => 2000
//     ]);
// }
// \`\`\`

// ## 🔧 API Endpoints

// | Method | Endpoint | Description |
// |--------|----------|-------------|
// | GET | /api/devices | Get all devices |
// | POST | /api/device/add | Add new device |
// | DELETE | /api/device/{id} | Remove device |
// | POST | /api/send-message | Send single message |
// | POST | /api/send-bulk | Send bulk messages |
// | GET | /api/stats | Get system stats |

// ## 🛡️ Anti-Banned Features

// - Rate limiting (20 messages/minute per device)
// - Random delays between messages
// - Automatic reconnection
// - Session persistence
// - QR code regeneration

// ## 📊 Monitoring

// Access real-time monitoring at: ${env('APP_URL')}/admin/wa-engine
// `;
//     }
    
//     private function getEnvExampleContent()
//     {
//         return `# WhatsApp Engine Configuration
// PORT=3000
// NODE_ENV=production

// # PPOB Integration
// PPOB_API_URL=${env('APP_URL')}
// PPOB_API_KEY=your-laravel-api-key

// # WhatsApp Settings
// MAX_DEVICES=5
// MAX_MESSAGES_PER_MINUTE=20
// MESSAGE_DELAY_MIN=2000
// MESSAGE_DELAY_MAX=5000
// RECONNECT_DELAY=5000

// # Security
// API_KEY=your-wa-engine-api-key
// CORS_ORIGIN=${env('APP_URL')}

// # Logging
// LOG_LEVEL=info
// LOG_DIR=./logs
// `;
//     }


}
