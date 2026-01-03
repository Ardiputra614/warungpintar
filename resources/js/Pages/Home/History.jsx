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
    const [copiedToken, setCopiedToken] = useState(false);
    const [status, setStatus] = useState(data?.transaction_status || "pending");
    const [isChecking, setIsChecking] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);

    /* =====================
        EXTRACT TOKEN UTILITY
    ====================== */
    const extractCopyableToken = (serialNumber) => {
        if (!serialNumber) return "";

        // Untuk PLN: ambil bagian sebelum slash pertama
        if (typeof serialNumber === "string" && serialNumber.includes("/")) {
            const parts = serialNumber.split("/");
            return parts[0].trim();
        }

        return serialNumber;
    };

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
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timer);
                    setStatus("expired"); // ⬅️ INI KUNCI
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [status]);

    /* =====================
        POLLING STATUS (FIXED)
    ====================== */

    const [digiflazzStatus, setDigiflazzStatus] = useState(
        data?.digiflazz_status
    );
    useEffect(() => {
        // Fungsi untuk check status
        const checkStatus = async () => {
            try {
                setIsChecking(true);
                const res = await axios.get(`/api/transaction/status`, {
                    params: { order_id: data.order_id },
                });

                if (res.data?.status) {
                    const newStatus = res.data.status;

                    // Update status
                    setStatus(newStatus);
                    setDigiflazzStatus(res.data.digiflazz_status);

                    // Jika sudah settlement, kembalikan untuk cleanup
                    return newStatus;
                }
            } catch (err) {
                console.error("Error checking status:", err);
            } finally {
                setIsChecking(false);
            }

            return null;
        };

        // 1. CEK STATUS SEKARANG (initial check)
        const initialCheck = async () => {
            const currentStatus = await checkStatus();

            // 2. HANYA POLLING JIKA MASIH PENDING
            if (currentStatus === "pending") {
                // Set interval polling
                const interval = setInterval(async () => {
                    const latestStatus = await checkStatus();

                    // Stop polling jika sudah settlement/cancel
                    if (latestStatus !== "pending") {
                        clearInterval(interval);
                    }
                }, 5000); // Poll setiap 5 detik

                // Cleanup function
                return () => clearInterval(interval);
            }
        };

        // Jalankan hanya jika ada order_id
        if (data?.order_id) {
            initialCheck();
        }
    }, [data?.order_id]); // Hanya depend on order_id

    /* =====================
        POLLING DIGIFLAZZ STATUS
    ====================== */
    useEffect(() => {
        if (
            !data?.order_id ||
            data.digiflazz_status === "Sukses" ||
            data.digiflazz_status === "Gagal" ||
            status === "expired"
        )
            return;

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(
                    `/api/transaction/digiflazz-status`,
                    {
                        params: { order_id: data.order_id },
                    }
                );

                if (
                    res.data?.digiflazz_status &&
                    res.data.digiflazz_status !== data.digiflazz_status
                ) {
                    // Update data dengan status baru
                    // Anda bisa refresh page atau update state sesuai kebutuhan
                    window.location.reload();
                }
            } catch (err) {
                console.error("Error polling DigiFlazz:", err);
            }
        }, 10000); // Poll setiap 10 detik

        return () => clearInterval(interval);
    }, [data?.order_id, data?.digiflazz_status]);

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
        COPY TOKEN
    ====================== */
    const handleCopyToken = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedToken(true);
            setTimeout(() => setCopiedToken(false), 2000);
        } catch {
            alert("Gagal menyalin token");
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
        expired: {
            icon: XCircle,
            color: "text-red-500",
            label: "Kedaluwarsa",
            message: "Waktu pembayaran telah habis",
        },
    };

    const CurrentIcon = statusConfig[status]?.icon || Clock;

    /* =====================
        TOKEN DISPLAY COMPONENT
    ====================== */
    const TokenDisplay = ({ serialNumber }) => {
        if (!serialNumber) return null;

        const isPlnToken =
            serialNumber.includes("/") && serialNumber.includes("KWH");
        const copyableToken = extractCopyableToken(serialNumber);

        if (!isPlnToken) {
            return (
                <div className="bg-gray-900 p-3 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">
                        Serial Number
                    </div>
                    <div className="font-mono break-all">{serialNumber}</div>
                    {/* <button
                        onClick={() => handleCopyToken(serialNumber)}
                        className="mt-2 text-blue-400 text-sm flex items-center hover:text-blue-300 transition-colors"
                    >
                        <Copy className="w-3 h-3 mr-1" />
                        {copiedToken ? "✓ Tersalin" : "Salin"}
                    </button> */}
                </div>
            );
        }

        // Parse PLN token details
        const parts = serialNumber.split("/");
        const token = parts[0]?.trim() || "";
        const customerName = parts[1]?.trim() || "";
        const daya = parts[3]?.trim() || "";
        const kwh = parts[4]?.replace("KWH", "")?.trim() || "";

        return (
            <div className="bg-gray-900 rounded-lg p-4">
                {/* Token utama */}
                <div className="mb-4">
                    <div className="text-gray-400 text-sm mb-1">
                        Token Listrik
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="font-mono text-xl tracking-wider bg-black p-3 rounded-lg">
                            {token}
                        </div>
                        <button
                            onClick={() => handleCopyToken(token)}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center text-sm transition-colors"
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            {copiedToken ? "Tersalin" : "Copy Token"}
                        </button>
                    </div>
                </div>

                {/* Detail tambahan */}
                <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-800 pt-3">
                    {customerName && (
                        <div>
                            <div className="text-gray-400">Nama Pelanggan</div>
                            <div className="font-medium">{customerName}</div>
                        </div>
                    )}
                    {daya && (
                        <div>
                            <div className="text-gray-400">Daya</div>
                            <div className="font-medium">{daya}</div>
                        </div>
                    )}
                    {kwh && (
                        <div>
                            <div className="text-gray-400">KWH</div>
                            <div className="font-medium">{kwh} KWH</div>
                        </div>
                    )}
                </div>

                {/* Full SN untuk referensi */}
                <div className="mt-3 pt-3 border-t border-gray-800">
                    <div className="text-gray-400 text-xs mb-1">
                        Data Lengkap
                    </div>
                    <div className="text-xs text-gray-500 break-all bg-black p-2 rounded">
                        {serialNumber}
                    </div>
                </div>
            </div>
        );
    };

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

            <div className="min-h-screen text-white py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {/* HEADER */}
                    <Link
                        href="/"
                        className="flex items-center text-gray-400 mb-4 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Beranda
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
                            <div className="mt-4 text-yellow-400 flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                Sisa waktu: {formatTime(timeLeft)}
                            </div>
                        )}
                    </div>

                    {status === "expired" && (
                        <div className="mt-4 text-red-400 flex items-center">
                            <XCircle className="w-4 h-4 mr-2" />
                            Silakan buat transaksi baru
                        </div>
                    )}

                    {/* TOKEN/SN SECTION - DITAMBAHKAN */}
                    {data.serial_number && (
                        <div className="bg-gray-800 rounded-xl p-6 mb-6">
                            <h3 className="font-semibold mb-4 flex items-center">
                                <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                                Detail Produk
                            </h3>
                            <TokenDisplay serialNumber={data.serial_number} />
                        </div>
                    )}

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
                                        className="text-blue-400 flex items-center hover:text-blue-300 transition-colors"
                                    >
                                        <Copy className="w-4 h-4 mr-1" />
                                        {copied ? "✓ Tersalin" : "Salin"}
                                    </button>
                                </div>
                            </div>
                        )}

                    {/* QRIS */}
                    {data.payment_type === "qris" && status === "pending" && (
                        <div className="bg-gray-800 rounded-xl p-6 mb-6">
                            <h3 className="font-semibold mb-4 flex items-center">
                                <Download className="w-5 h-5 mr-2" />
                                QRIS
                            </h3>

                            <div className="flex flex-col items-center gap-4">
                                <a
                                    href={data.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src={data.url}
                                        alt="QRIS"
                                        className="w-48 h-48 bg-white p-2 rounded-lg cursor-pointer hover:scale-105 transition-transform"
                                    />
                                </a>

                                <div className="flex gap-3">
                                    <button
                                        onClick={downloadQR}
                                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center transition-colors"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download QR
                                    </button>

                                    <button
                                        onClick={() => handleCopy(data.url)}
                                        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center transition-colors"
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
                        <h3 className="font-semibold mb-4 pb-3 border-b border-gray-700">
                            Informasi Transaksi
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between py-2">
                                <span className="text-gray-400">Order ID</span>
                                <span className="font-mono">
                                    {data.order_id}
                                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-400">Produk</span>
                                <span className="font-medium">
                                    {data.product_name}
                                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-400">
                                    Nomor Tujuan
                                </span>
                                <span className="font-medium">
                                    {data.customer_no}
                                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-400">
                                    Metode Pembayaran
                                </span>
                                <span className="font-medium">
                                    {data.payment_method_name.toUpperCase()}
                                </span>
                            </div>
                            {/* DigiFlazz Status */}
                            <div className="flex justify-between py-2">
                                <span className="text-gray-400">
                                    Status Pemesanan
                                </span>
                                <span
                                    className={`font-semibold ${
                                        digiflazzStatus === "Sukses"
                                            ? "text-green-400"
                                            : digiflazzStatus === "Gagal"
                                            ? "text-red-400"
                                            : "text-yellow-400"
                                    }`}
                                >
                                    {digiflazzStatus || "Menunggu"}
                                </span>
                            </div>

                            <div className="flex justify-between py-2">
                                <span className="text-gray-400">
                                    Tanggal Transaksi
                                </span>
                                <span className="font-medium">
                                    {new Date(
                                        data.created_at
                                    ).toLocaleDateString("id-ID", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                    })}
                                </span>
                            </div>
                            {/* Payment Status */}
                            <div className="flex justify-between py-2">
                                <span className="text-gray-400">
                                    Status Pembayaran
                                </span>
                                <span
                                    className={`font-semibold ${
                                        status === "settlement"
                                            ? "text-green-400"
                                            : status === "pending"
                                            ? "text-yellow-400"
                                            : "text-red-400"
                                    }`}
                                >
                                    {status === "settlement"
                                        ? "Berhasil"
                                        : status === "pending"
                                        ? "Menunggu"
                                        : status || "Gagal"}
                                </span>
                            </div>
                            {/* Total */}
                            <div className="flex justify-between py-2 font-bold border-t border-gray-700 pt-4 mt-2">
                                <span>Total Pembayaran</span>
                                <span className="text-lg">
                                    {formatRupiah(data.gross_amount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* INFO TAMBAHAN */}
                    {data.digiflazz_data && (
                        <div className="bg-gray-800 rounded-xl p-6 mt-6">
                            <h3 className="font-semibold mb-4">
                                Info Tambahan
                            </h3>
                            <div className="text-gray-400 text-sm">
                                Transaksi diproses melalui DigiFlazz. Status
                                akan diperbarui secara otomatis.
                            </div>
                        </div>
                    )}

                    {/* FOOTER */}
                    <div className="text-center text-gray-500 text-sm mt-6">
                        © {new Date().getFullYear()} ARFENAZ MVA
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
