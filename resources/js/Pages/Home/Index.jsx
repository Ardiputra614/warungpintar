import React, { useState, useEffect, useRef } from "react";
import {
    Gamepad2,
    Phone,
    Wifi,
    Zap,
    ChevronRight,
    Shield,
    Clock,
    TrendingUp,
    Search,
    ArrowRight,
    Sparkles,
    Zap as Lightning,
    BatteryCharging,
    Globe,
    CreditCard,
    CheckCircle,
    Star,
    Gift,
    Trophy,
    Users,
    Award,
    ShoppingBag,
    Moon,
    Sun,
} from "lucide-react";
import { Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import Games from "./Games";
import Pulsa from "./Pulsa";
import Data from "./Data";
import PLN from "./Tagihan";

const Index = ({ games }) => {
    const [orderId, setOrderId] = useState("");
    const [kategori, setKategori] = useState("Games");

    const gamesCategory = games.filter(
        (g) => g.category.toLowerCase() === kategori.toLowerCase()
    );

    const services = [
        {
            name: "Top Up Game",
            value: "Games",
        },
        {
            name: "Pulsa & Data",
            value: "Provider",
        },
        {
            name: "Token Listrik",
            value: "PLN",
        },
        {
            name: "Pascabayar",
            value: "Pascabayar",
        },
    ];

    const [activePromo, setActivePromo] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const promoRef = useRef(null);

    const promos = [
        {
            id: 1,
            title: "DISKON SPESIAL 50% MOBILE LEGENDS!",
            description:
                "Top up diamond Mobile Legends diskon hingga 50%. Periode promo terbatas!",
            bgColor:
                "bg-gradient-to-r from-purple-800 via-pink-800 to-rose-900",
            badge: "HOT",
            badgeColor: "bg-red-600",
            icon: <Trophy className="text-yellow-400" size={32} />,
            cta: "Claim Now",
            accentColor: "#8B5CF6",
        },
        {
            id: 2,
            title: "PROMO PULSA! BONUS 10%",
            description:
                "Dapatkan bonus 10% untuk semua pembelian pulsa. Syarat dan ketentuan berlaku.",
            bgColor:
                "bg-gradient-to-r from-teal-800 via-emerald-800 to-green-900",
            badge: "NEW",
            badgeColor: "bg-blue-600",
            icon: <Gift className="text-teal-200" size={32} />,
            cta: "Get Bonus",
            accentColor: "#14B8A6",
        },
        {
            id: 3,
            title: "PAKET DATA LEBIH MURAH!",
            description:
                "Hemat hingga 20% untuk pembelian paket data internet. Nikmati internet lebih cepat!",
            bgColor: "bg-gradient-to-r from-blue-800 via-cyan-800 to-sky-900",
            badge: "POPULAR",
            badgeColor: "bg-amber-600",
            icon: <TrendingUp className="text-blue-200" size={32} />,
            cta: "Shop Now",
            accentColor: "#0EA5E9",
        },
    ];

    const stats = [
        { icon: <Users size={20} />, value: "10K+", label: "Pengguna Aktif" },
        {
            icon: <CheckCircle size={20} />,
            value: "99.8%",
            label: "Success Rate",
        },
        { icon: <Clock size={20} />, value: "< 1m", label: "Proses Cepat" },
        { icon: <Award size={20} />, value: "4.9/5", label: "Rating" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActivePromo((prev) => (prev + 1) % promos.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [promos.length]);

    return (
        <AppLayout>
            {/* Modern Hero Section - Dark Theme */}
            <div className="relative overflow-hidden bg-[#37353E]">
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-90"></div>
                <div className="absolute top-0 left-0 right-0 h-64 transform -skew-y-3"></div>

                <div className="container mx-auto px-4 pt-8 relative">
                    {/* Promo Carousel */}
                    <div ref={promoRef} className="mb-12">
                        <div className="flex justify-between items-center mb-6">
                            {/* <div>
                                <h2 className="text-2xl font-bold text-[#D3DAD9] flex items-center gap-2">
                                    <Sparkles
                                        className="text-yellow-400"
                                        size={24}
                                    />
                                    Promo Spesial Hari Ini
                                </h2>
                                <p className="text-gray-300">
                                    Diskon eksklusif untuk Anda
                                </p>
                            </div> */}
                            <div className="flex gap-2">
                                {promos.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActivePromo(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            activePromo === idx
                                                ? "bg-purple-500 w-6"
                                                : "bg-gray-600"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="relative h-64 rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50">
                            {promos.map((promo, idx) => (
                                <div
                                    key={promo.id}
                                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                                        promo.bgColor
                                    } ${
                                        idx === activePromo
                                            ? "opacity-100 z-10"
                                            : "opacity-0 z-0"
                                    }`}
                                >
                                    <div className="absolute inset-0 bg-black/40"></div>
                                    {/* <div className="absolute top-6 left-8">
                                        <span
                                            className={`${promo.badgeColor} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}
                                        >
                                            {promo.badge}
                                        </span>
                                    </div> */}
                                    <div className="absolute top-6 right-8">
                                        {promo.icon}
                                    </div>
                                    <div className="absolute bottom-8 left-8 right-8">
                                        <h3 className="text-2xl font-bold text-white mb-2">
                                            {promo.title}
                                        </h3>
                                        <p className="text-gray-200 mb-6">
                                            {promo.description}
                                        </p>
                                        {/* <button
                                            className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center gap-2 border border-white/20 hover:border-white/30"
                                            style={{
                                                backgroundColor:
                                                    promo.accentColor + "20",
                                                borderColor:
                                                    promo.accentColor + "40",
                                            }}
                                        >
                                            {promo.cta}
                                            <ArrowRight size={18} />
                                        </button> */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pb-16 bg-[#37353E]">
                {/* Services Section */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-[#D3DAD9]">
                                Kategori Layanan
                            </h2>
                            <p className="text-gray-300">
                                Pilih layanan yang Anda butuhkan
                            </p>
                        </div>
                    </div>

                    <div className="flex overflow-auto whitespace-nowrap">
                        {services.map((service, index) => (
                            <button
                                key={index}
                                onClick={() => setKategori(service.value)}
                                className={`${
                                    service.value.toLocaleLowerCase() ===
                                    kategori.toLowerCase()
                                        ? "bg-black"
                                        : ""
                                } flex-shrink-0 px-3 py-2 mx-2 rounded-2xl transition-all duration-300 hover:scale-[1.02] border-2 flex flex-col items-center text-center group backdrop-blur-sm`}
                            >
                                <h3
                                    className={`font-bold text-lg mb-2 text-white whitespace-nowrap`}
                                >
                                    {service.name}
                                </h3>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dynamic Content */}
                <div className="mb-12">
                    {kategori && (
                        <Games
                            games={gamesCategory}
                            title="Top Up Game Populer"
                            layout="grid"
                            columns={4}
                            className="dark-mode"
                        />
                    )}
                    {/* {kategori === "Pulsa" && (
                        <Pulsa
                            games={providerCategory}
                            title="Pulsa & Paket Data"
                            layout="card"
                            className="dark-mode"
                        />
                    )}
                    {kategori === "PLN" && (
                        <PLN
                            PLN={PLNCategory}
                            title="Token Listrik & PLN"
                            className="dark-mode"
                        />
                    )}
                    {kategori === "Lainnya" && (
                        <div className="text-center py-12 bg-[#44444E] rounded-3xl border border-gray-700/50">
                            <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-[#D3DAD9] mb-2">
                                Layanan Lainnya Segera Hadir
                            </h3>
                            <p className="text-gray-400">
                                Kami sedang menyiapkan layanan terbaik untuk
                                Anda
                            </p>
                        </div>
                    )} */}
                </div>

                {/* Transaction Check & Calculator */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-[#44444E] to-[#37353E] rounded-3xl p-8 shadow-xl border border-gray-700/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                                <Search className="text-white" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#D3DAD9]">
                                    Cek Status Transaksi
                                </h3>
                                <p className="text-gray-300">
                                    Lacak pesanan Anda dengan mudah
                                </p>
                            </div>
                        </div>

                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Masukkan ID Transaksi
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Contoh: TRX-123456789"
                                        value={orderId}
                                        onChange={(e) =>
                                            setOrderId(e.target.value)
                                        }
                                        className="w-full px-4 py-4 pl-12 bg-[#44444E] rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                                    />
                                    <CreditCard
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                                        size={20}
                                    />
                                </div>
                            </div>
                            <Link
                                href={`/history/${orderId}`}
                                className={`w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all shadow-lg ${
                                    !orderId
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                Cek Status Transaksi
                                <ArrowRight size={18} />
                            </Link>
                        </form>

                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <p className="text-sm text-gray-400 flex items-center gap-2">
                                <Clock size={16} className="text-gray-400" />
                                Status update real-time setiap 5 menit
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Index;
