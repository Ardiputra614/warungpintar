import React, { useState, useEffect } from "react";
import {
    Gamepad2,
    Phone,
    Wifi,
    Zap,
    ChevronRight,
    Shield,
    Clock,
    TrendingUp,
} from "lucide-react";
import { Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import Games from "./Games";
import Pulsa from "./Pulsa";
import Data from "./Data";
import Tagihan from "./Tagihan";
import Banner from "@/Components/Banner";

const Index = ({ games, provider, tagihan }) => {
    const [orderId, setOrderId] = useState("");
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

    useEffect(() => {
        const interval = setInterval(() => {
            setActivePromo((prev) => (prev + 1) % promos.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [promos.length]);

    return (
        <AppLayout>
            <Banner promos={promos} activePromo={activePromo} />
            <div className="min-h-screen">
                {/* Top Banner */}
                <div className="container mx-auto px-4 py-6">
                    {/* Service Tabs */}
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
                                        key={index}
                                        onClick={() =>
                                            setKategori(service.name)
                                        }
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

                    {/* Content */}
                    {kategori === "Games" && <Games games={games} />}
                    {kategori === "Pulsa" && <Pulsa provider={provider} />}
                    {kategori === "Tagihan" && <Tagihan tagihan={tagihan} />}
                    {kategori === "Paket Data" && <Data provider={provider} />}

                    {/* Submenu: Cek Transaksi dan Kalkulator */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Cek Transaksi
                            </h3>
                            <form>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Masukkan ID Transaksi:
                                </label>
                                <input
                                    type="text"
                                    placeholder="contoh: TRX123456"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                                />
                                <Link
                                    href={`/history/${orderId}`}
                                    type="button"
                                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                                >
                                    Cek Status
                                </Link>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Index;
