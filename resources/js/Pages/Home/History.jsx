import { useEffect, useState } from "react";
import {
    CheckCircle,
    Copy,
    Download,
    ArrowLeft,
    Share2,
    Home,
    MessageCircle,
    CircleMinusIcon,
    CircleX,
} from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";

export default function History({ data }) {
    const [copied, setCopied] = useState(false);
    console.log(data);
    // Data transaksi contoh
    const transaction = {
        id: "TRX-12345678",
        date: "02 April 2025 14:30 WIB",
        product: "Telkomsel 10.000",
        number: "081234567890",
        amount: 11000,
        paymentMethod: "QRIS",
        status: "Berhasil",
    };

    const handleCopyTransactionId = () => {
        navigator.clipboard.writeText(
            data.payment_type === "bank_transfer" &&
                data.va_numbers[0].va_number
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatRupiah = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const [status, setStatus] = useState("pending");

    useEffect(() => {
        const interval = setInterval(() => {
            axios
                .get(`/api/transaction/status`, {
                    params: { order_id: data.order_id },
                })
                .then((res) => {
                    setStatus(res.data.status);
                    if (res.data.status !== "pending") {
                        clearInterval(interval); // Stop polling if status is final
                        axios.post("/api/topup").then((res) => {
                            console.log(res);
                            if (res.data.data.status === "Sukses") {
                                window.location.href = "/";
                                // localStorage.removeItem("transkey");
                            }
                        });
                    }
                })
                .catch((err) => {
                    console.error("Error checking status:", err);
                });
        }, 3000); // cek setiap 3 detik

        return () => clearInterval(interval); // bersihkan saat komponen unmount
    }, [data.order_id]);

    return (
        <AppLayout>
            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                {/* Success Message */}
                <div className="bg-white rounded-lg p-6 shadow-sm mb-6 text-center">
                    <div className="flex justify-center mb-4">
                        {status === "settlement" ? (
                            <CheckCircle size={64} className="text-green-500" />
                        ) : status === "pending" ? (
                            <CircleMinusIcon
                                size={64}
                                className="text-yellow-500"
                            />
                        ) : status === "cancel" ? (
                            <CircleX size={64} className="text-red-500" />
                        ) : null}
                    </div>
                    <h2 className="text-xl font-bold mb-2">
                        Pembayaran {status}
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Transaksi telah berhasil diproses pada{" "}
                        {transaction.date}
                    </p>
                    {data.payment_type === "bank_transfer" && (
                        <div className="flex items-center justify-center">
                            <span className="text-gray-700 font-medium mr-2">
                                {data.payment_type === "bank_transfer" &&
                                    data.va_numbers[0].va_number}
                            </span>
                            <button
                                className="p-1 text-blue-600 hover:text-blue-800"
                                onClick={handleCopyTransactionId}
                            >
                                {copied ? (
                                    <CheckCircle
                                        size={16}
                                        className="text-green-500"
                                    />
                                ) : (
                                    <Copy size={16} />
                                )}
                            </button>
                        </div>
                    )}
                </div>
                {/* Transaction Details */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">
                            Detail Produk
                        </h3>
                    </div>

                    <div className="p-4">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Produk</span>
                                <span className="font-medium text-gray-800">
                                    {transaction.product}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Nomor Tujuan
                                </span>
                                <span className="font-medium text-gray-800">
                                    {transaction.number}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Harga</span>
                                <span className="font-medium text-gray-800">
                                    {formatRupiah(data.gross_amount)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Metode Pembayaran
                                </span>
                                <span className="font-medium text-gray-800">
                                    {data.payment_type === "bank_transfer"
                                        ? data.va_numbers[0].bank
                                        : data.payment_type}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status</span>
                                <span className="font-medium text-green-500">
                                    {status}
                                </span>
                            </div>
                            <div>
                                {data.payment_type !== "bank_transfer" && (
                                    <img
                                        src={data.actions[0].url}
                                        className="w-60"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Customer Information */}
                {/* <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">
                            Informasi Penerima
                        </h3>
                    </div>

                    <div className="p-4">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Nama Provider
                                </span>
                                <span className="font-medium text-gray-800">
                                    Telkomsel
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Nomor</span>
                                <span className="font-medium text-gray-800">
                                    {transaction.number}
                                </span>
                            </div>
                        </div>
                    </div>
                </div> */}
                {/* Customer Service */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800">
                            Layanan Pelanggan
                        </h3>
                    </div>

                    <div className="p-4">
                        <p className="text-gray-600 text-sm mb-4">
                            Jika ada pertanyaan atau kendala terkait transaksi
                            ini, silakan hubungi Customer Service kami.
                        </p>
                        <button className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg">
                            <MessageCircle size={18} className="mr-2" />
                            <span>Hubungi Customer Service</span>
                        </button>
                    </div>
                </div>
                {/* Receipt Actions */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm hover:bg-gray-50">
                        <Download size={24} className="text-blue-600 mb-2" />
                        <span className="text-sm font-medium">Unduh Bukti</span>
                    </button>
                    {/* <button className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm hover:bg-gray-50">
                        <Share2 size={24} className="text-blue-600 mb-2" />
                        <span className="text-sm font-medium">Bagikan</span>
                    </button> */}
                </div>
                {/* Fixed Bottom Buttons */}
                {/* <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg flex space-x-4">
                    <button className="flex-1 bg-white border border-blue-600 text-blue-600 py-3 rounded-lg font-bold flex items-center justify-center">
                        <Home size={18} className="mr-2" />
                        Kembali ke Beranda
                    </button>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold">
                        Transaksi Baru
                    </button>
                </div>
                <div className="h-20"></div> Spacer for fixed buttons */}
            </main>
        </AppLayout>
    );
}
