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

const Index = ({ services, categories }) => {
    const [orderId, setOrderId] = useState("");
    const [kategori, setKategori] = useState(categories[0]?.id || null);

    // Debug
    console.log("Selected kategori:", kategori);
    console.log("Categories:", categories);
    console.log("Services sample:", services[0]);

    // Filter services berdasarkan category_id yang dipilih
    const servicesData = services.filter((service) => {
        // Cek beberapa kemungkinan field
        const serviceCategoryId =
            service.category_id || service.category?.id || service.kategori;
        console.log(
            `Service: ${
                service.name
            }, Category ID: ${serviceCategoryId}, Match: ${
                serviceCategoryId == kategori
            }`
        );
        return serviceCategoryId == kategori; // Gunakan == untuk handle string vs number
    });

    console.log("Filtered services count:", servicesData.length);

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

                <div className="container mx-auto px-4 relative">
                    {/* Promo Carousel */}
                    <div ref={promoRef} className="mb-12">
                        <div className="flex justify-between items-center mb-6">
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 bg-[#37353E]">
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
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setKategori(category.id)}
                                className={`${
                                    category.id === kategori ? "bg-black" : ""
                                } flex-shrink-0 px-3 py-2 mx-2 rounded-2xl transition-all duration-300 hover:scale-[1.02] border-2 flex flex-col items-center text-center group backdrop-blur-sm`}
                            >
                                <h3
                                    className={`font-bold text-lg mb-2 text-white whitespace-nowrap`}
                                >
                                    {category.name}
                                </h3>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dynamic Content */}
                <div className="mb-12">
                    {servicesData.length > 0 ? (
                        <Games
                            games={servicesData}
                            title={`${
                                categories.find((c) => c.id == kategori)
                                    ?.name || "Layanan"
                            } Populer`}
                            layout="grid"
                            columns={4}
                            className="dark-mode"
                        />
                    ) : (
                        <div className="text-center py-12 bg-[#44444E] rounded-3xl border border-gray-700/50">
                            <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-[#D3DAD9] mb-2">
                                Belum ada layanan
                            </h3>
                            <p className="text-gray-400">
                                Tidak ada layanan untuk kategori "
                                {categories.find((c) => c.id == kategori)
                                    ?.name || "kategori ini"}
                                "
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default Index;
