import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import {
    TrendingUp,
    Users,
    CreditCard,
    Wallet,
    AlertTriangle,
    RefreshCw,
} from "lucide-react";

export default function Dashboard({ auth, totalTransaksi, title }) {
    const stats = [
        {
            title: "Total Transaksi",
            value: "12.450",
            icon: CreditCard,
            trend: "+8%",
        },
        {
            title: "Pendapatan Hari Ini",
            value: "Rp 8.750.000",
            icon: Wallet,
            trend: "+5%",
        },
        { title: "Pengguna Aktif", value: "3.210", icon: Users, trend: "+2%" },
        {
            title: "Transaksi Gagal",
            value: "18",
            icon: AlertTriangle,
            trend: "-3%",
        },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard
                </h2>
            }
        >
            <div className="p-6 space-y-6 min-h-screen">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#4b2e1e]">
                            Dashboard Super Admin
                        </h1>
                        <p className="text-sm text-gray-600">
                            Ringkasan performa aplikasi PPOB
                        </p>
                    </div>
                    <button className="bg-[#6b3f26] hover:bg-[#5a341f] text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((item, index) => (
                        <div className="rounded-2xl shadow-sm">
                            <div className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        {item.title}
                                    </p>
                                    <h2 className="text-xl font-semibold text-[#4b2e1e]">
                                        {item.value}
                                    </h2>
                                    <span className="text-xs text-green-600">
                                        {item.trend}
                                    </span>
                                </div>
                                <item.icon className="w-8 h-8 text-[#6b3f26]" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts & Logs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Placeholder */}
                    <div className="lg:col-span-2 rounded-2xl">
                        <div className="p-6">
                            <h3 className="font-semibold text-[#4b2e1e] mb-2">
                                Grafik Transaksi
                            </h3>
                            <div className="h-56 flex items-center justify-center text-gray-400">
                                Grafik transaksi harian / bulanan
                            </div>
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="rounded-2xl">
                        <div className="p-6">
                            <h3 className="font-semibold text-[#4b2e1e] mb-4">
                                Aktivitas Terbaru
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between">
                                    <span>User topup PLN</span>
                                    <span className="text-green-600">
                                        Sukses
                                    </span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Topup Game ML</span>
                                    <span className="text-green-600">
                                        Sukses
                                    </span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Isi Pulsa Telkomsel</span>
                                    <span className="text-red-600">Gagal</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Topup Dana</span>
                                    <span className="text-green-600">
                                        Sukses
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
