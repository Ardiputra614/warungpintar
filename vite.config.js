// import { defineConfig } from "vite";
// import laravel from "laravel-vite-plugin";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//     plugins: [
//         laravel({
//             input: "resources/js/app.jsx",
//             refresh: true,
//         }),
//         react(),
//     ],
// });

// vite.config.js
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
    ],

    build: {
        // Code splitting otomatis
        rollupOptions: {
            output: {
                // Manual chunks untuk optimasi
                manualChunks: (id) => {
                    // Pisahkan node_modules
                    if (id.includes("node_modules")) {
                        if (id.includes("react") || id.includes("react-dom")) {
                            return "vendor-react";
                        }
                        if (id.includes("@inertiajs")) {
                            return "vendor-inertia";
                        }
                        if (id.includes("axios") || id.includes("lodash")) {
                            return "vendor-utils";
                        }
                        if (id.includes("filament")) {
                            return "vendor-filament";
                        }
                        return "vendor-other";
                    }

                    // Pisahkan page berdasarkan route
                    if (id.includes("resources/js/Pages/")) {
                        const pageName = id.split("Pages/")[1].split(".")[0];

                        // Group page yang sering diakses bersama
                        if (
                            pageName.includes("Auth/") ||
                            pageName.includes("Login") ||
                            pageName.includes("Register")
                        ) {
                            return "pages-auth";
                        }
                        if (
                            pageName.includes("Dashboard") ||
                            pageName.includes("Index")
                        ) {
                            return "pages-dashboard";
                        }
                        if (pageName.includes("Admin")) {
                            return "pages-admin";
                        }

                        // Lazy load page lainnya
                        return (
                            "pages-" +
                            pageName.toLowerCase().replace(/\//g, "-")
                        );
                    }
                },

                // Optimasi naming
                chunkFileNames: "assets/[name]-[hash].js",
                entryFileNames: "assets/[name]-[hash].js",
                assetFileNames: "assets/[name]-[hash][extname]",
            },
        },

        // Tingkatkan limit karena kita split jadi banyak chunk
        chunkSizeWarningLimit: 500, // Turunkan karena kita split

        // Minify agresif
        // minify: "terser",
        // terserOptions: {
        //     compress: {
        //         drop_console: true,
        //         drop_debugger: true,
        //         pure_funcs: ["console.log", "console.debug"],
        //     },
        //     mangle: {
        //         safari10: true, // Support Safari mobile lama
        //     },
        // },

        // Target browser modern (tapi tetap support mobile)
        target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
    },

    // Optimasi dependencies
    optimizeDeps: {
        include: ["react", "react-dom", "@inertiajs/react"],
        exclude: ["@filament/filament"], // Exclude filament dari optimasi (terpisah)
    },
});
