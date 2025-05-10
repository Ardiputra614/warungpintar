import React, { useState, useEffect } from "react";
import {
    Home,
    Wallet,
    Receipt,
    History,
    User,
    Search,
    Bell,
    Phone,
    Wifi,
    Zap,
    CreditCard,
    TrendingUp,
    ChevronRight,
    Gamepad2,
    Gift,
    Camera,
    ShoppingBag,
    Monitor,
    Music,
    Coffee,
    Navigation,
    ShoppingCart,
    Award,
    Clock,
    Shield,
} from "lucide-react";
import { Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import Games from "./Games";
import Pulsa from "./Pulsa";
import Data from "./Data";
import Tagihan from "./Tagihan";

const Index = ({ games, provider, tagihan, cache }) => {
    console.log(cache);
    const services = [
        {
            icon: <Gamepad2 size={24} />,
            name: "Games",
            color: "bg-indigo-100 text-indigo-600",
        },
        {
            icon: <Phone size={24} />,
            name: "Pulsa",
            color: "bg-red-100 text-red-600",
        },
        {
            icon: <Wifi size={24} />,
            name: "Paket Data",
            color: "bg-blue-100 text-blue-600",
        },
        {
            icon: <Zap size={24} />,
            name: "Tagihan",
            color: "bg-yellow-100 text-yellow-600",
        },
    ];

    const [kategori, setKategori] = useState("Games");
    const [activePromo, setActivePromo] = useState(0);

    // Dummy promos data
    const promos = [
        {
            id: 1,
            title: "DISKON SPESIAL 50% MOBILE LEGENDS!",
            description:
                "Top up diamond Mobile Legends diskon hingga 50%. Periode promo terbatas!",
            bgColor: "from-blue-600 to-indigo-700",
            image: "/api/placeholder/400/200",
        },
        {
            id: 2,
            title: "PROMO PULSA! BONUS 10%",
            description:
                "Dapatkan bonus 10% untuk semua pembelian pulsa. Syarat dan ketentuan berlaku.",
            bgColor: "from-red-500 to-pink-600",
            image: "/api/placeholder/400/200",
        },
        {
            id: 3,
            title: "PAKET DATA LEBIH MURAH!",
            description:
                "Hemat hingga 20% untuk pembelian paket data internet. Nikmati internet lebih cepat!",
            bgColor: "from-green-500 to-teal-600",
            image: "/api/placeholder/400/200",
        },
    ];

    // Popular games
    const popularGames = [
        {
            id: 1,
            name: "Mobile Legends",
            image: "/api/placeholder/100/100",
            tag: "TRENDING",
        },
        { id: 2, name: "PUBG Mobile", image: "/api/placeholder/100/100" },
        {
            id: 3,
            name: "Genshin Impact",
            image: "/api/placeholder/100/100",
            tag: "HOT",
        },
        { id: 4, name: "Free Fire", image: "/api/placeholder/100/100" },
    ];

    // Auto rotate promos
    useEffect(() => {
        const interval = setInterval(() => {
            setActivePromo((prev) => (prev + 1) % promos.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [promos.length]);

    return (
        <AppLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Top Banner (Hero Section) */}
                <div className="bg-gradient-to-r from-blue-700 to-purple-600 text-white">
                    <div className="container mx-auto py-6 px-4 sm:px-6">
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="mb-8 md:mb-0 md:w-1/2">
                                <h1 className="text-4xl font-bold mb-4">
                                    Top Up Game Favoritmu!
                                </h1>
                                <p className="text-xl mb-6">
                                    Dapatkan diamond, koin, dan item game dengan
                                    harga terbaik.
                                </p>
                                <div className="flex space-x-4">
                                    <span className="inline-flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">
                                        <Shield className="h-5 w-5 mr-2" /> 100%
                                        Aman
                                    </span>
                                    <span className="inline-flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">
                                        <Clock className="h-5 w-5 mr-2" />{" "}
                                        Proses Instan
                                    </span>
                                </div>
                            </div>
                            <div className="md:w-1/2">
                                <img
                                    src="/api/placeholder/600/300"
                                    alt="Game Top Up"
                                    className="rounded-lg shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-6">
                    {/* Saldo & Points Card */}
                    {/* <div className="bg-gradient-to-r from-amber-600 to-amber-400 rounded-xl shadow-lg p-4 mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-white text-opacity-80 text-sm">
                                    Saldo Anda
                                </p>
                                <h3 className="text-white text-2xl font-bold">
                                    Rp 120.000
                                </h3>
                            </div>
                            <div>
                                <p className="text-white text-opacity-80 text-sm text-right">
                                    Points
                                </p>
                                <h3 className="text-white text-2xl font-bold">
                                    350
                                </h3>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-4 gap-2">
                            <button className="flex flex-col items-center bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg">
                                <Wallet size={20} className="text-white" />
                                <span className="text-white text-xs mt-1">
                                    Top Up
                                </span>
                            </button>
                            <button className="flex flex-col items-center bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg">
                                <TrendingUp size={20} className="text-white" />
                                <span className="text-white text-xs mt-1">
                                    Transfer
                                </span>
                            </button>
                            <button className="flex flex-col items-center bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg">
                                <CreditCard size={20} className="text-white" />
                                <span className="text-white text-xs mt-1">
                                    Withdraw
                                </span>
                            </button>
                            <button className="flex flex-col items-center bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg">
                                <History size={20} className="text-white" />
                                <span className="text-white text-xs mt-1">
                                    History
                                </span>
                            </button>
                        </div>
                    </div> */}

                    {/* Services Grid */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Layanan
                            </h2>
                            <Link
                                href="#"
                                className="text-amber-500 text-sm font-medium flex items-center"
                            >
                                Lihat Semua <ChevronRight size={16} />
                            </Link>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm">
                            <div className="grid grid-cols-4 gap-4">
                                {services.map((service, index) => (
                                    <button
                                        onClick={() =>
                                            setKategori(service.name)
                                        }
                                        key={index}
                                        className={`p-3 rounded-xl transition-all hover:shadow-md flex flex-col items-center gap-2 ${
                                            kategori === service.name
                                                ? "bg-amber-50 border-2 border-amber-300"
                                                : ""
                                        }`}
                                    >
                                        <div
                                            className={`w-12 h-12 rounded-full ${service.color} flex items-center justify-center`}
                                        >
                                            {service.icon}
                                        </div>
                                        <span
                                            className={`text-xs font-medium ${
                                                kategori === service.name
                                                    ? "text-amber-700"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            {service.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Render the selected category component */}
                    {kategori === "Games" ? <Games games={games} /> : <></>}
                    {kategori === "Pulsa" ? (
                        <Pulsa provider={provider} />
                    ) : (
                        <></>
                    )}
                    {kategori === "Tagihan" ? (
                        <Tagihan tagihan={tagihan} />
                    ) : (
                        <></>
                    )}
                    {kategori === "Paket Data" ? (
                        <Data provider={provider} />
                    ) : (
                        <></>
                    )}
                    {["Voucher", "TV Digital", "Musik", "Lainnya"].includes(
                        kategori
                    ) ? (
                        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                <Navigation
                                    className="text-amber-600"
                                    size={32}
                                />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">
                                Fitur {kategori} akan segera hadir!
                            </h3>
                            <p className="text-gray-600">
                                Kami sedang mengembangkan layanan ini. Nantikan
                                update selanjutnya ya!
                            </p>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default Index;
