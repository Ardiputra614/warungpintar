import React from "react";
import {
    Facebook,
    Instagram,
    Twitter,
    Mail,
    PhoneCall,
    MapPin,
    Shield,
    CreditCard,
    Zap,
    Gamepad2,
    Users,
} from "lucide-react";
import { Link } from "@inertiajs/react";

const Footer = ({ aplikasi }) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-[#37353E] to-[#44444E] border-t border-gray-700/50 mt-16">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10">
                    {/* Brand & Contact - Enhanced */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                <Zap className="text-white" size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Warung Pintar
                                </h2>
                                <p className="text-sm text-gray-400">
                                    Top Up & Payment
                                </p>
                            </div>
                        </div>

                        <p className="text-gray-300 leading-relaxed">
                            Platform top up terpercaya dengan layanan lengkap
                            dan proses instan. Dukung aktivitas digital Anda
                            dengan kemudahan bertransaksi.
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-purple-600/20 transition-colors">
                                    <PhoneCall
                                        size={14}
                                        className="text-gray-400 group-hover:text-purple-400"
                                    />
                                </div>
                                <span className="text-gray-300 group-hover:text-white transition-colors">
                                    +62 812-3456-7890
                                </span>
                            </div>

                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-purple-600/20 transition-colors">
                                    <Mail
                                        size={14}
                                        className="text-gray-400 group-hover:text-purple-400"
                                    />
                                </div>
                                <span className="text-gray-300 group-hover:text-white transition-colors">
                                    support@warungpintar.com
                                </span>
                            </div>

                            <div className="flex items-center gap-3 group cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:bg-purple-600/20 transition-colors">
                                    <MapPin
                                        size={14}
                                        className="text-gray-400 group-hover:text-purple-400"
                                    />
                                </div>
                                <span className="text-gray-300 group-hover:text-white transition-colors">
                                    Purbalingga, Central Java
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links - Enhanced */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-[#D3DAD9] flex items-center gap-2">
                            <Gamepad2 size={18} className="text-purple-400" />
                            Navigasi Cepat
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { name: "Beranda", href: "/", icon: "🏠" },
                                {
                                    name: "Top Up Game",
                                    href: "/games",
                                    icon: "🎮",
                                },
                                {
                                    name: "Pulsa & Data",
                                    href: "/pulsa",
                                    icon: "📱",
                                },
                                {
                                    name: "Token Listrik",
                                    href: "/pln",
                                    icon: "⚡",
                                },
                                {
                                    name: "Cek Transaksi",
                                    href: "/history",
                                    icon: "📋",
                                },
                                {
                                    name: "Kalkulator",
                                    href: "/calculator",
                                    icon: "🧮",
                                },
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            →
                                        </span>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Information - Enhanced */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-[#D3DAD9] flex items-center gap-2">
                            <Shield size={18} className="text-teal-400" />
                            Informasi
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { name: "Syarat & Ketentuan", href: "/terms" },
                                { name: "Kebijakan Privasi", href: "/privacy" },
                                { name: "FAQ", href: "/faq" },
                                {
                                    name: "Cara Pembayaran",
                                    href: "/payment-guide",
                                },
                                { name: "Tentang Kami", href: "/about" },
                                { name: "Kontak", href: "/contact" },
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-gray-400 hover:text-teal-400 transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social & Newsletter - Enhanced */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-[#D3DAD9] flex items-center gap-2">
                            <Users size={18} className="text-cyan-400" />
                            Terhubung Dengan Kami
                        </h3>

                        {/* Social Media */}
                        <div className="space-y-4">
                            <p className="text-gray-400 text-sm">
                                Ikuti kami untuk update promo terbaru
                            </p>
                            <div className="flex gap-3">
                                {[
                                    {
                                        icon: <Facebook size={18} />,
                                        href: "#",
                                        color: "bg-blue-600 hover:bg-blue-700",
                                        label: "Facebook",
                                    },
                                    {
                                        icon: <Instagram size={18} />,
                                        href: "#",
                                        color: "bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
                                        label: "Instagram",
                                    },
                                    {
                                        icon: <Twitter size={18} />,
                                        href: "#",
                                        color: "bg-sky-500 hover:bg-sky-600",
                                        label: "Twitter",
                                    },
                                ].map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        className={`w-10 h-10 rounded-xl ${social.color} flex items-center justify-center text-white transition-all hover:scale-110 hover:shadow-lg`}
                                        aria-label={social.label}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="pt-6 border-t border-gray-700/50">
                            <p className="text-gray-400 text-sm mb-3">
                                Metode Pembayaran
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {["💳", "🏦", "📱", "💰", "💸"].map(
                                    (method, idx) => (
                                        <div
                                            key={idx}
                                            className="w-10 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-sm"
                                        >
                                            {method}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Banner */}
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl p-6 mb-10 border border-gray-700/30">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            {
                                icon: (
                                    <Shield
                                        className="text-green-400"
                                        size={20}
                                    />
                                ),
                                title: "100% Aman",
                                desc: "Transaksi Terenkripsi",
                            },
                            {
                                icon: (
                                    <Zap
                                        className="text-yellow-400"
                                        size={20}
                                    />
                                ),
                                title: "Instan",
                                desc: "Proses Cepat",
                            },
                            {
                                icon: (
                                    <CreditCard
                                        className="text-purple-400"
                                        size={20}
                                    />
                                ),
                                title: "Lengkap",
                                desc: "Banyak Metode",
                            },
                            {
                                icon: (
                                    <Users
                                        className="text-cyan-400"
                                        size={20}
                                    />
                                ),
                                title: "24/7",
                                desc: "Support Online",
                            },
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-[#D3DAD9]">
                                        {feature.title}
                                    </h4>
                                    <p className="text-sm text-gray-400">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Copyright & Additional Info */}
                <div className="pt-8 border-t border-gray-700/50">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <p className="text-gray-400 text-sm">
                                © {currentYear}{" "}
                                <span className="text-purple-400 font-semibold">
                                    Warung Pintar
                                </span>
                                . All rights reserved.
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                                PT. Warung Pintar Digital Indonesia • NPWP:
                                12.345.678.9-012.345
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                            <a
                                href="#"
                                className="hover:text-purple-400 transition-colors"
                            >
                                Kebijakan Cookie
                            </a>
                            <a
                                href="#"
                                className="hover:text-purple-400 transition-colors"
                            >
                                Disclaimer
                            </a>
                            <a
                                href="#"
                                className="hover:text-purple-400 transition-colors"
                            >
                                Sitemap
                            </a>
                            <a
                                href="#"
                                className="hover:text-purple-400 transition-colors"
                            >
                                Bahasa: 🇮🇩 Indonesia
                            </a>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-gray-700/30">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Shield size={12} className="text-green-500" />
                            <span>SSL Secured</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Verified Merchant</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>🔒</span>
                            <span>PCI DSS Compliant</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating CTA (Mobile) */}
            {/* <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 p-4 z-50">
                <div className="flex justify-between items-center max-w-7xl mx-auto px-4">
                    <div>
                        <p className="text-white font-semibold">
                            Butuh Bantuan?
                        </p>
                        <p className="text-white/80 text-sm">
                            Hubungi kami 24/7
                        </p>
                    </div>
                    <a
                        href="tel:+6281234567890"
                        className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                    >
                        Telepon
                    </a>
                </div>
            </div> */}
        </footer>
    );
};

export default Footer;
