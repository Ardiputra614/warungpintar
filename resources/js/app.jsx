// import "./bootstrap";
// import "../css/app.css";

// import { createRoot } from "react-dom/client";
// import { createInertiaApp } from "@inertiajs/react";
// import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";

// const appName = import.meta.env.VITE_APP_NAME || "Laravel";

// createInertiaApp({
//     title: (title) => `${title} - ${appName}`,
//     resolve: (name) =>
//         resolvePageComponent(
//             `./Pages/${name}.jsx`,
//             import.meta.glob("./Pages/**/*.jsx")
//         ),

//     setup({ el, App, props }) {
//         const root = createRoot(el);

//         root.render(<App {...props} />);
//     },
//     progress: {
//         color: "#4B5563",
//     },
// });

import "./bootstrap"; // inisialisasi bootstrap (axios, csrf token)
import "../css/app.css"; // CSS Tailwind dan custom

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";

// Nama aplikasi, bisa dari .env
const appName = import.meta.env.VITE_APP_NAME || "Laravel";

// Inisialisasi Inertia App
createInertiaApp({
    title: (title) => `${title} - ${appName}`,

    // Resolve halaman Inertia dengan dynamic import
    resolve: (name) => {
        const pages = import.meta.glob("./Pages/**/*.jsx");

        // Cek halaman ada atau tidak
        const importPage = pages[`./Pages/${name}.jsx`];
        if (!importPage) {
            throw new Error(
                `Page ${name} tidak ditemukan. Pastikan nama file benar.`
            );
        }

        return importPage();
    },

    setup({ el, App, props }) {
        // React 18 root rendering
        const root = createRoot(el);
        root.render(<App {...props} />);
    },

    // Progress bar Inertia
    progress: {
        color: "#4B5563", // warna abu-abu gelap
        showSpinner: false, // optional: hide spinner
    },
});
