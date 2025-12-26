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

import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
    ],

    build: {
        target: "es2017", // 🔥 AMAN HP & iOS lama
        outDir: "public/build",
        emptyOutDir: true,
        sourcemap: false, // ❌ matikan di production

        rollupOptions: {
            output: {
                manualChunks: {
                    react: ["react", "react-dom"],
                },
            },
        },
    },

    esbuild: {
        drop: ["console", "debugger"], // 🧹 bersihin prod
    },

    resolve: {
        alias: {
            "@": "/resources/js",
        },
    },
});
