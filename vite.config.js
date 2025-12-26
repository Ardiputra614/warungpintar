// import { defineConfig } from 'vite';
// import laravel from 'laravel-vite-plugin';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//     plugins: [
//         laravel({
//             input: 'resources/js/app.jsx',
//             refresh: true,
//         }),
//         react(),
//     ],
// });

// vite.config.js
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.js"],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Pisahkan vendor libraries
                    vendor: ["vue", "axios", "@inertiajs/vue3"],
                    // Pisahkan Filament jika ada
                    filament: ["@filament/filament"],
                    // Pisahkan component besar
                    pages: [
                        "resources/js/Pages/Welcome.vue",
                        "resources/js/Pages/Dashboard.vue",
                    ],
                },
            },
        },
        // Tingkatkan limit warning
        chunkSizeWarningLimit: 1000,
        // Optimasi untuk production
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: true, // Hapus console.log di production
            },
        },
    },
    // Optimasi untuk mobile
    optimizeDeps: {
        include: ["vue", "@inertiajs/vue3", "axios"],
    },
});
