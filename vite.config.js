import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: "resources/js/app.jsx",
            refresh: true,
        }),
        react(),
    ],
    define: {
        "process.env": {},
        "process.browser": true,
    },

    //ini tambahan
    build: {
        target: "es2017",
        chunkSizeWarningLimit: 1000, // optional (1MB)
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ["react", "react-dom"],
                    vendor: ["axios"],
                },
            },
        },
    },
});
