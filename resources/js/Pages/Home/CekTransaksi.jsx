import AppLayout from "@/Layouts/AppLayout";
import { Link } from "@inertiajs/react";
import { ArrowRight, Clock, CreditCard, Search } from "lucide-react";
import { useState } from "react";

const CekTransaksi = () => {
    const [orderId, setOrderId] = useState("");
    return (
        <>
            {/* Transaction Check & Calculator */}
            <div className="flex items-center justify-center">
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
                                    onChange={(e) => setOrderId(e.target.value)}
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
                                !orderId ? "opacity-50 cursor-not-allowed" : ""
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
        </>
    );
};

CekTransaksi.layout = (page) => <AppLayout children={page} />;
export default CekTransaksi;
