import { useEffect, useState } from "react";
import {
    CheckCircle,
    Copy,
    Download,
    ArrowLeft,
    Home,
    MessageCircle,
    Clock,
    XCircle,
    AlertCircle,
} from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";

export default function History({ data, error, orderId }) {
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState(data?.transaction_status || "pending");
    const [isChecking, setIsChecking] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);

    /* =====================
        FORMATTER
    ====================== */
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const formatRupiah = (amount) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount || 0);

    /* =====================
        COUNTDOWN
    ====================== */
    useEffect(() => {
        if (status !== "pending") return;

        const timer = setInterval(() => {
            setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [status]);

    /* =====================
        POLLING STATUS (FIXED)
    ====================== */
    useEffect(() => {
        if (!data?.order_id || status !== "pending") return;

        const interval = setInterval(async () => {
            try {
                setIsChecking(true);
                const res = await axios.get(`/api/transaction/status`, {
                    params: { order_id: data.order_id },
                });

                if (res.data?.status && res.data.status !== status) {
                    setStatus(res.data.status);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsChecking(false);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [data?.order_id, status]);

    /* =====================
        COPY VA
    ====================== */
    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            alert("Browser tidak mendukung copy");
        }
    };

    /* =====================
        DOWNLOAD QRIS
    ====================== */
    const downloadQR = () => {
        const link = document.createElement("a");
        link.href = data.url;
        link.download = `QRIS-${data.order_id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /* =====================
        STATUS CONFIG
    ====================== */
    const statusConfig = {
        settlement: {
            icon: CheckCircle,
            color: "text-green-500",
            label: "Berhasil",
            message: "Pembayaran berhasil",
        },
        pending: {
            icon: Clock,
            color: "text-yellow-400",
            label: "Menunggu Pembayaran",
            message: "Segera selesaikan pembayaran",
        },
        cancel: {
            icon: XCircle,
            color: "text-red-500",
            label: "Dibatalkan",
            message: "Transaksi dibatalkan",
        },
    };

    const CurrentIcon = statusConfig[status]?.icon || Clock;

    /* =====================
        ERROR PAGE
    ====================== */
    if (!data) {
        return (
            <AppLayout>
                <Head title="Transaksi Tidak Ditemukan" />
                <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                    {error || "Transaksi tidak ditemukan"}
                </div>
            </AppLayout>
        );
    }

    /* =====================
        MAIN PAGE
    ====================== */
    return (
        <AppLayout>
            <Head title={`Transaksi ${data.order_id}`} />

            <div className="min-h-screen  text-white py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* HEADER */}
                    <Link
                        href="/"
                        className="flex items-center text-gray-400 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Link>

                    {/* STATUS */}
                    <div className="bg-gray-800 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-4">
                            <CurrentIcon
                                className={`w-10 h-10 ${statusConfig[status].color}`}
                            />
                            <div>
                                <h2 className="text-xl font-bold">
                                    {statusConfig[status].label}
                                </h2>
                                <p className="text-gray-400">
                                    {statusConfig[status].message}
                                </p>
                            </div>
                        </div>

                        {status === "pending" && (
                            <div className="mt-4 text-yellow-400">
                                Sisa waktu: {formatTime(timeLeft)}
                            </div>
                        )}
                    </div>

                    {/* BANK TRANSFER */}
                    {data.payment_type === "bank_transfer" &&
                        status === "pending" && (
                            <div className="bg-gray-800 rounded-xl p-6 mb-6">
                                <h3 className="font-semibold mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    Virtual Account{" "}
                                    {data.payment_method_name.toUpperCase()}
                                </h3>

                                <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg">
                                    <span className="font-mono text-xl">
                                        {data.url}
                                    </span>
                                    <button
                                        onClick={() => handleCopy(data.url)}
                                        className="text-blue-400 flex items-center"
                                    >
                                        <Copy className="w-4 h-4 mr-1" />
                                        {copied ? "Tersalin" : "Salin"}
                                    </button>
                                </div>
                            </div>
                        )}

                    {/* QRIS */}
                    {data.payment_type === "qris" && status === "pending" && (
                        <div className="bg-gray-800 rounded-xl p-6 mb-6">
                            <h3 className="font-semibold mb-4">QRIS</h3>

                            <div className="flex flex-col items-center gap-4">
                                <a
                                    href={data.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src={data.url}
                                        alt="QRIS"
                                        className="w-48 h-48 bg-white p-2 rounded-lg cursor-pointer"
                                    />
                                </a>

                                <div className="flex gap-3">
                                    <button
                                        onClick={downloadQR}
                                        className="bg-green-600 px-4 py-2 rounded-lg flex items-center"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download QR
                                    </button>

                                    <button
                                        onClick={() => handleCopy(data.url)}
                                        className="bg-gray-700 px-4 py-2 rounded-lg flex items-center"
                                    >
                                        <Copy className="w-4 h-4 mr-2" />
                                        Salin Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DETAIL */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <div className="flex justify-between py-2">
                            <span>Order ID</span>
                            <span>{data.order_id}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span>Produk</span>
                            <span>{data.product_name}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span>Nomor</span>
                            <span>{data.customer_no}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span>Serial Number</span>
                            <span>{data.serial_number}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span>Status Pembelian {data.product_name}</span>
                            <span>{data.digiflazz_status}</span>
                        </div>
                        <div className="flex justify-between py-2 font-bold">
                            <span>Total</span>
                            <span>{formatRupiah(data.gross_amount)}</span>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="text-center text-gray-500 text-sm mt-6">
                        © {new Date().getFullYear()} ARFENAZ MVA
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
