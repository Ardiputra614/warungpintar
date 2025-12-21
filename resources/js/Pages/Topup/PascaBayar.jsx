import FormatRupiah from "@/Components/FormatRupiah";
import AppLayout from "@/Layouts/AppLayout";
import React, { useState, useEffect } from "react";
import axios from "axios";

const PascaBayar = ({
    products,
    payment,
    appUrl,
    game,
    formatConfig,
    exampleFormat,
}) => {
    // === COLOR PALETTE DARK THEME ===
    const COLORS = {
        primary: "#1F2937",
        secondary: "#374151",
        accent: "#4B5563",
        surface: "#111827",
        light: "#F9FAFB",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
        purple: "#8B5CF6",
        pink: "#EC4899",
    };

    // === STATE UTAMA ===
    const [accountData, setAccountData] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [waPembeli, setWaPembeli] = useState("");
    const [activeStep, setActiveStep] = useState(1);

    // === STATE KHUSUS PASCABAYAR ===
    const [pascabayarData, setPascabayarData] = useState({
        inquiryData: null,
        refIdInquiry: null,
        isChecking: false,
        error: null,
        billDetails: null,
    });

    // === FUNGSI UTAMA ===

    // Format nomor pelanggan
    const formatCustomerNo = () => {
        if (!game) return "";

        if (game.customer_no_format === "satu_input") {
            return accountData.field1 || "";
        }

        if (game.customer_no_format === "dua_input") {
            const field1 = accountData.field1 || "";
            const field2 = accountData.field2 || "";
            const separator = game.separator || "";

            if (field1 && !field2) return field1;
            if (!field1 && field2) return field2;
            if (field1 && field2) {
                return `${field1}${separator}${field2}`;
            }

            return "";
        }

        return "";
    };

    // Cek kelengkapan akun
    const isAccountComplete = () => {
        if (!game) return false;

        if (game.customer_no_format === "satu_input") {
            return accountData.field1 && accountData.field1.trim() !== "";
        }

        if (game.customer_no_format === "dua_input") {
            return (
                accountData.field1 &&
                accountData.field1.trim() !== "" &&
                accountData.field2 &&
                accountData.field2.trim() !== ""
            );
        }

        return false;
    };

    // === FUNGSI PASCABAYAR ===

    // 1. INQUIRY - Cek tagihan
    const checkPascabayar = async () => {
        if (!isAccountComplete()) {
            alert("Harap lengkapi data pelanggan terlebih dahulu");
            return;
        }

        setPascabayarData((prev) => ({
            ...prev,
            isChecking: true,
            error: null,
            inquiryData: null,
            billDetails: null,
        }));

        try {
            const customerNo = formatCustomerNo();
            const productCode =
                selectedProduct?.buyer_sku_code || products[0]?.buyer_sku_code;

            if (!productCode) {
                throw new Error("Produk tidak ditemukan");
            }

            const response = await axios.post(`/api/inquiry-pln`, {
                customer_no: customerNo,
                buyer_sku_code: productCode,
                category: game.category,
            });

            console.log("Inquiry Response:", response.data);

            if (response.data.success) {
                const inquiryData = response.data.data;

                // PERBAIKAN DI SINI: Simpan seluruh data response, bukan hanya mapping ke billDetails
                setPascabayarData((prev) => ({
                    ...prev,
                    inquiryData: inquiryData,
                    refIdInquiry: response.data.ref_id,
                    // Simpan semua data dari response untuk fleksibilitas
                    ...inquiryData, // Spread semua properti dari inquiryData
                    billDetails: {
                        amount: parseFloat(inquiryData.price) || 0,
                        admin: parseFloat(inquiryData.admin) || 0,
                        total:
                            (parseFloat(inquiryData.selling_price) || 0) +
                            (parseFloat(inquiryData.admin) || 0),
                        customer_name: inquiryData.customer_name || "N/A",
                        period: inquiryData.desc?.jatuh_tempo || "N/A",
                        meter_no:
                            inquiryData.desc?.detail?.[0]?.meter_awal || "N/A",
                        segment_power: inquiryData.desc?.tarif || "N/A",
                        product_code: inquiryData.buyer_sku_code,
                    },
                }));

                // Auto select product jika belum
                if (!selectedProduct && inquiryData.buyer_sku_code) {
                    const matchedProduct = products.find(
                        (p) => p.buyer_sku_code === inquiryData.buyer_sku_code
                    );
                    if (matchedProduct) {
                        setSelectedProduct(matchedProduct);
                    }
                }

                // Update step
                setActiveStep(2);
            } else {
                setPascabayarData((prev) => ({
                    ...prev,
                    error: response.data.message || "Gagal memeriksa tagihan",
                }));
            }
        } catch (error) {
            console.error("Pascabayar inquiry error:", error);

            let errorMessage = "Terjadi kesalahan sistem";
            if (error.response) {
                errorMessage =
                    error.response.data?.message ||
                    error.response.data?.error ||
                    "Server error";
            } else if (error.request) {
                errorMessage = "Tidak ada respon dari server";
            }

            setPascabayarData((prev) => ({
                ...prev,
                error: errorMessage,
            }));
        } finally {
            setPascabayarData((prev) => ({ ...prev, isChecking: false }));
        }
    };

    // 2. Hitung total pembayaran
    const calculateTotalPayment = () => {
        if (!selectedProduct) return 0;

        // Untuk pascabayar: pakai nominal dari inquiry
        if (pascabayarData.selling_price) {
            const billAmount = Number(pascabayarData.selling_price) || 0;
            let totalFee = 0;

            if (paymentMethod) {
                if (paymentMethod.percentase_fee > 0) {
                    totalFee +=
                        (billAmount * paymentMethod.percentase_fee) / 100;
                }
                totalFee += Number(paymentMethod.nominal_fee) || 0;
            }

            return billAmount + totalFee;
        }

        return 0;
    };

    // 3. Hitung biaya admin
    const calculateTotalFee = () => {
        if (!paymentMethod || !pascabayarData.billDetails) return 0;

        const billAmount = Number(pascabayarData.billDetails.total) || 0;
        let totalFee = 0;

        if (paymentMethod.percentase_fee > 0) {
            totalFee += (billAmount * paymentMethod.percentase_fee) / 100;
        }

        totalFee += Number(paymentMethod.nominal_fee) || 0;

        return totalFee;
    };

    // === HANDLERS ===

    // Handle perubahan input
    const handleAccountChange = (fieldKey, value) => {
        const cleanedValue = value.replace(/\s+/g, "");
        setAccountData((prev) => ({ ...prev, [fieldKey]: cleanedValue }));
    };

    // Handle submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormComplete) {
            alert("Mohon lengkapi semua data terlebih dahulu.");
            return;
        }

        // Konfirmasi pembayaran pascabayar
        if (pascabayarData.billDetails) {
            const isConfirmed = window.confirm(
                `Konfirmasi Pembayaran:\n\n` +
                    `Layanan: ${game.name}\n` +
                    `Nama: ${pascabayarData.billDetails.customer_name}\n` +
                    `Tagihan: Rp ${pascabayarData.billDetails.total.toLocaleString()}\n` +
                    `Total Bayar: Rp ${calculateTotalPayment().toLocaleString()}\n\n` +
                    `Apakah Anda yakin ingin melanjutkan?`
            );

            if (!isConfirmed) return;
        }

        const customerNo = formatCustomerNo();

        // Siapkan data untuk backend
        const data = {
            id: selectedProduct.id,
            buyer_sku_code: selectedProduct.buyer_sku_code,
            product_name: selectedProduct.product_name,
            selling_price: pascabayarData.billDetails?.total || 0,
            gross_amount: calculateTotalPayment(),
            fee: calculateTotalFee(),
            paymentMethod: paymentMethod.name,
            customer_no: customerNo,
            payment_type: paymentMethod.payment_type,
            wa_pembeli: waPembeli,
            customer_format: game.customer_no_format,

            // Data khusus pascabayar
            is_pascabayar: true,
            inquiry_data: pascabayarData.inquiryData,
            ref_id_inquiry: pascabayarData.refIdInquiry,
            bill_amount: pascabayarData.billDetails?.amount,
            admin_fee: pascabayarData.billDetails?.admin,

            // Data tambahan jika format dua_input
            ...(game.customer_no_format === "dua_input" && {
                field1: accountData.field1,
                field2: accountData.field2,
                separator: game.separator,
            }),
        };

        console.log("Data pembayaran pascabayar:", data);

        try {
            const response = await axios.post(
                "/api/midtrans/transaction",
                data
            );

            if (response.data.data?.transaction_status === "pending") {
                const orderId = response.data.data.order_id;

                // Simpan data untuk halaman history
                sessionStorage.setItem(
                    "pascabayar_data",
                    JSON.stringify({
                        inquiryData: pascabayarData.inquiryData,
                        billDetails: pascabayarData.billDetails,
                        product: selectedProduct,
                        paymentMethod: paymentMethod,
                        customerNo: customerNo,
                        timestamp: new Date().toISOString(),
                        orderId: orderId,
                    })
                );

                window.location.href = `/history/${orderId}`;
            } else {
                console.error("Payment error:", response.data);
                alert("Gagal membuat pembayaran. Silakan coba lagi.");
            }
        } catch (error) {
            console.error("Error creating payment:", error.response || error);
            alert("Terjadi kesalahan dalam membuat pembayaran");
        }
    };

    // === EFFECTS ===

    // Update form completion
    useEffect(() => {
        const isValid =
            isAccountComplete() &&
            pascabayarData.inquiryData &&
            selectedProduct &&
            paymentMethod &&
            waPembeli;

        setIsFormComplete(isValid);
    }, [
        accountData,
        selectedProduct,
        paymentMethod,
        waPembeli,
        pascabayarData.inquiryData,
    ]);

    // Update active step
    useEffect(() => {
        if (isAccountComplete()) setActiveStep(2);
        if (pascabayarData.inquiryData) setActiveStep(3);
        if (paymentMethod) setActiveStep(4);
        if (waPembeli) setActiveStep(5);
    }, [
        isAccountComplete(),
        pascabayarData.inquiryData,
        paymentMethod,
        waPembeli,
    ]);

    const [daerah, setDaerah] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        // Debounce untuk hindari terlalu banyak re-render
        const timeoutId = setTimeout(() => {
            if (!daerah.trim()) {
                setFilteredProducts(products);
                return;
            }

            const searchTerm = daerah.toLowerCase();
            const filtered = products.filter((p) =>
                p.product_name.toLowerCase().includes(searchTerm)
            );

            setFilteredProducts(filtered);
        }, 300); // Delay 300ms

        // Cleanup timeout
        return () => clearTimeout(timeoutId);
    }, [daerah, products]);

    // === RENDER COMPONENTS ===

    // Step Indicator Component
    const StepIndicator = ({ step, title, isActive, isComplete }) => {
        return (
            <div className="flex items-center">
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition ${
                        isComplete
                            ? "border-emerald-500"
                            : isActive
                            ? "border-blue-500"
                            : "border-gray-600"
                    }`}
                    style={{
                        backgroundColor: isComplete
                            ? COLORS.success
                            : isActive
                            ? COLORS.secondary
                            : "transparent",
                    }}
                >
                    {isComplete ? (
                        <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    ) : (
                        <span
                            className={`text-sm font-medium ${
                                isActive ? "text-blue-400" : "text-gray-500"
                            }`}
                        >
                            {step}
                        </span>
                    )}
                </div>
                <span
                    className={`ml-2 text-sm font-medium ${
                        isActive
                            ? "text-blue-400"
                            : isComplete
                            ? "text-emerald-400"
                            : "text-gray-500"
                    }`}
                >
                    {title}
                </span>
            </div>
        );
    };

    // Render input fields
    const renderAccountInputs = () => {
        return (
            <div className="space-y-6">
                {isAccountComplete() && (
                    <div
                        className="mb-6 rounded-xl p-4"
                        style={{
                            backgroundColor: COLORS.success + "20",
                            border: `1px solid ${COLORS.success}40`,
                        }}
                    >
                        <div className="flex items-center">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                                style={{ backgroundColor: COLORS.success }}
                            >
                                <svg
                                    className="w-4 h-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="3"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-100">
                                    Data pelanggan sudah terisi
                                </p>
                                <p className="text-gray-300 text-sm font-mono break-all">
                                    {formatCustomerNo()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Field 1 */}
                <div className="space-y-2">
                    <label
                        className="block text-sm font-medium text-gray-200"
                        htmlFor="field1"
                    >
                        {game.field1_label || "Nomor Pelanggan"} *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="field1"
                            className="w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 transition bg-gray-800 text-gray-100 border-gray-700 focus:border-blue-500 focus:ring-blue-500/30"
                            placeholder={
                                game.field1_placeholder ||
                                "Masukkan nomor pelanggan"
                            }
                            value={accountData.field1 || ""}
                            onChange={(e) =>
                                handleAccountChange("field1", e.target.value)
                            }
                            maxLength={game.field1_maxlength || 20}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Field 2 (jika dua_input) */}
                {game.customer_no_format === "dua_input" && (
                    <div className="space-y-2">
                        <label
                            className="block text-sm font-medium text-gray-200"
                            htmlFor="field2"
                        >
                            {game.field2_label || "Field 2"} *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="field2"
                                className="w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 transition bg-gray-800 text-gray-100 border-gray-700 focus:border-blue-500 focus:ring-blue-500/30"
                                placeholder={
                                    game.field2_placeholder ||
                                    "Masukkan data tambahan"
                                }
                                value={accountData.field2 || ""}
                                onChange={(e) =>
                                    handleAccountChange(
                                        "field2",
                                        e.target.value
                                    )
                                }
                                maxLength={game.field2_maxlength || 20}
                            />
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <svg
                                    className="w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tombol Check Pascabayar */}
                {isAccountComplete() &&
                    !pascabayarData.isChecking &&
                    !pascabayarData.inquiryData && (
                        <button
                            type="button"
                            onClick={checkPascabayar}
                            className="w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition flex items-center justify-center"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                            Cek Tagihan
                        </button>
                    )}

                {/* Loading State */}
                {pascabayarData.isChecking && (
                    <div className="w-full px-4 py-3 rounded-lg bg-blue-700 text-white font-medium flex items-center justify-center">
                        <svg
                            className="animate-spin h-5 w-5 mr-3 text-white"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Memeriksa tagihan...
                    </div>
                )}

                {/* Error Message */}
                {pascabayarData.error && (
                    <div className="mt-4 p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                        <div className="flex items-center">
                            <svg
                                className="w-5 h-5 text-red-400 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="text-sm text-red-300">
                                {pascabayarData.error}
                            </p>
                        </div>
                    </div>
                )}

                {/* Bill Details */}
                {pascabayarData.billDetails && (
                    <div
                        className="mt-6 p-5 rounded-xl border"
                        style={{
                            backgroundColor: COLORS.info + "10",
                            borderColor: COLORS.info + "30",
                        }}
                    >
                        <h4 className="font-bold text-lg text-gray-100 mb-4 flex items-center">
                            <svg
                                className="w-5 h-5 mr-2 text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                            Detail Tagihan
                        </h4>

                        <div className="space-y-3">
                            {/* Informasi Pelanggan */}
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">
                                    Nama Pelanggan
                                </span>
                                <span className="text-sm font-semibold text-gray-200 text-right">
                                    {pascabayarData.customer_name || "N/A"}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-400">
                                    No. Pelanggan
                                </span>
                                <span className="text-sm font-semibold text-gray-200 text-right">
                                    {pascabayarData.customer_no || "N/A"}
                                </span>
                            </div>

                            {/* Informasi dari desc jika ada */}
                            {pascabayarData.desc && (
                                <>
                                    {/* Tampilkan data dari desc secara dinamis */}
                                    {pascabayarData.desc.tarif && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-400">
                                                Tarif
                                            </span>
                                            <span className="text-sm font-semibold text-gray-200">
                                                {pascabayarData.desc.tarif}
                                            </span>
                                        </div>
                                    )}

                                    {pascabayarData.desc.alamat && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-400">
                                                Alamat
                                            </span>
                                            <span className="text-sm font-semibold text-gray-200 text-right">
                                                {pascabayarData.desc.alamat}
                                            </span>
                                        </div>
                                    )}

                                    {pascabayarData.desc.jatuh_tempo && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-400">
                                                Jatuh Tempo
                                            </span>
                                            <span className="text-sm font-semibold text-gray-200">
                                                {
                                                    pascabayarData.desc
                                                        .jatuh_tempo
                                                }
                                            </span>
                                        </div>
                                    )}

                                    {/* PERBAIKAN DI SINI: typo pascababayarData -> pascabayarData */}
                                    {pascabayarData.desc.lembar_tagihan && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-400">
                                                Lembar Tagihan
                                            </span>
                                            <span className="text-sm font-semibold text-gray-200">
                                                {
                                                    pascabayarData.desc
                                                        .lembar_tagihan
                                                }{" "}
                                                lembar
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Detail tagihan per periode jika ada */}
                            {pascabayarData.desc?.detail &&
                                pascabayarData.desc.detail.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-blue-800/30">
                                        <h5 className="font-semibold text-gray-300 mb-3">
                                            Rincian Tagihan
                                        </h5>
                                        {pascabayarData.desc.detail.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="mb-4 p-3 rounded-lg bg-blue-900/20"
                                                >
                                                    {item.periode && (
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-sm text-gray-400">
                                                                Periode
                                                            </span>
                                                            <span className="text-sm font-semibold text-gray-200">
                                                                {item.periode}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {item.nilai_tagihan && (
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-sm text-gray-400">
                                                                Tagihan
                                                            </span>
                                                            <span className="text-sm font-semibold text-gray-200">
                                                                <FormatRupiah
                                                                    value={
                                                                        parseInt(
                                                                            item.nilai_tagihan
                                                                        ) || 0
                                                                    }
                                                                />
                                                            </span>
                                                        </div>
                                                    )}

                                                    {item.denda && (
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-sm text-gray-400">
                                                                Denda
                                                            </span>
                                                            <span className="text-sm font-semibold text-gray-200">
                                                                <FormatRupiah
                                                                    value={
                                                                        parseInt(
                                                                            item.denda
                                                                        ) || 0
                                                                    }
                                                                />
                                                            </span>
                                                        </div>
                                                    )}

                                                    {item.biaya_lain && (
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-sm text-gray-400">
                                                                Biaya Lain
                                                            </span>
                                                            <span className="text-sm font-semibold text-gray-200">
                                                                <FormatRupiah
                                                                    value={
                                                                        parseInt(
                                                                            item.biaya_lain
                                                                        ) || 0
                                                                    }
                                                                />
                                                            </span>
                                                        </div>
                                                    )}

                                                    {item.meter_awal && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-400">
                                                                Meter Awal
                                                            </span>
                                                            <span className="text-sm font-semibold text-gray-200">
                                                                {
                                                                    item.meter_awal
                                                                }
                                                            </span>
                                                        </div>
                                                    )}

                                                    {item.meter_akhir && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-400">
                                                                Meter Akhir
                                                            </span>
                                                            <span className="text-sm font-semibold text-gray-200">
                                                                {
                                                                    item.meter_akhir
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}

                            {/* Ringkasan Pembayaran */}
                            <div className="pt-4 border-t border-blue-800/30">
                                {/* <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">
                                        Harga Produk
                                    </span>
                                    <span className="font-medium text-gray-200">
                                        <FormatRupiah
                                            value={pascabayarData.price || 0}
                                        />
                                    </span>
                                </div> */}

                                {pascabayarData.admin > 0 && (
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400">
                                            Biaya Admin
                                        </span>
                                        <span className="font-medium text-gray-200">
                                            <FormatRupiah
                                                value={
                                                    pascabayarData.admin || 0
                                                }
                                            />
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-3 border-t border-blue-800/30">
                                    <span className="text-lg font-bold text-gray-100">
                                        Total Bayar
                                    </span>
                                    <span className="text-xl font-bold text-blue-300">
                                        <FormatRupiah
                                            value={
                                                pascabayarData.selling_price ||
                                                0
                                            }
                                        />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render product selection
    const renderProducts = () => {
        if (!products || products.length === 0) {
            return (
                <div className="text-center py-12 text-gray-400">
                    <svg
                        className="w-12 h-12 mx-auto text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="mt-2">Tidak ada produk tersedia</p>
                </div>
            );
        }

        return (
            <>
                <input
                    placeholder="cari daerah"
                    value={daerah}
                    onChange={(e) => setDaerah(e.target.value)}
                    className="w-full px-4 py-3 mb-4 border rounded-xl focus:outline-none focus:ring-2 transition bg-gray-900/50 text-gray-100 border-gray-700 focus:border-green-500 focus:ring-green-500/30"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                                selectedProduct?.id === product.id
                                    ? "shadow-lg scale-105 border-blue-500"
                                    : "border-gray-700 hover:border-gray-500"
                            }`}
                            onClick={() => setSelectedProduct(product)}
                            style={{
                                backgroundColor:
                                    selectedProduct?.id === product.id
                                        ? COLORS.secondary
                                        : COLORS.primary,
                            }}
                        >
                            {selectedProduct?.id === product.id && (
                                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    ✓
                                </div>
                            )}
                            <div className="font-bold text-gray-100 mb-2">
                                {product.product_name}
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    };

    // Render payment methods
    const renderPaymentMethods = () => {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {payment.map((method) => {
                    // Kalkulasi total harga
                    let totalPrice = 0;
                    let feeDetails = [];

                    if (selectedProduct) {
                        const productPrice = Number(
                            selectedProduct.selling_price ?? 0
                        );

                        // Hitung biaya persentase
                        let percentFee = 0;
                        if (
                            method.percentase_fee &&
                            method.percentase_fee > 0
                        ) {
                            percentFee =
                                (productPrice * method.percentase_fee) / 100;
                            feeDetails.push(`${method.percentase_fee}%`);
                        }

                        // Hitung biaya nominal
                        const nominalFee = Number(method.nominal_fee) || 0;
                        if (nominalFee > 0) {
                            feeDetails.push(
                                `Rp ${nominalFee.toLocaleString()}`
                            );
                        }

                        // Total harga
                        totalPrice = productPrice + percentFee + nominalFee;
                    }

                    return (
                        <div
                            key={method.id}
                            className={`border-2 rounded-xl p-4 flex items-center cursor-pointer transition-all ${
                                paymentMethod?.id === method.id
                                    ? "shadow-lg border-green-500 bg-green-900/20"
                                    : "border-gray-700 hover:border-gray-500"
                            }`}
                            onClick={() => setPaymentMethod(method)}
                        >
                            <div className="w-12 h-12 rounded-lg overflow-hidden border p-2 mr-3 bg-white">
                                <img
                                    src={`${appUrl}/storage/${method.logo}`}
                                    alt={method.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `${appUrl}/storage/default-payment.png`;
                                    }}
                                />
                            </div>
                            <div className="flex-grow">
                                <div className="font-semibold text-gray-100 uppercase">
                                    {method.name}
                                </div>
                                <div className="text-sm text-gray-400 mt-1">
                                    {selectedProduct ? (
                                        <div>
                                            <div
                                                className="font-bold"
                                                style={{
                                                    color: COLORS.success,
                                                }}
                                            >
                                                <FormatRupiah
                                                    // value={totalPrice}
                                                    value={calculateTotalPayment()}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">
                                            Pilih produk terlebih dahulu
                                        </span>
                                    )}
                                </div>
                            </div>
                            {paymentMethod?.id === method.id && (
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="3"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <AppLayout>
            <div className="min-h-screen">
                <div className="container mx-auto px-4 max-w-7xl py-8">
                    {/* Header */}
                    <div className="rounded-2xl shadow-xl overflow-hidden mb-8 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/20">
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                                <div className="relative">
                                    <img
                                        src={`${appUrl}/storage/${game.logo}`}
                                        alt={`${game.name} Logo`}
                                        className="w-28 h-28 rounded-2xl shadow-2xl object-cover border-4 border-white/20"
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-full">
                                        PASCA BAYAR
                                    </div>
                                </div>
                                <div className="text-center md:text-left">
                                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                                        {game.name}
                                    </h1>
                                    <p className="text-gray-300 text-lg">
                                        Bayar tagihan {game.name.toLowerCase()}{" "}
                                        dengan mudah dan aman
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-sm">
                                            Instant
                                        </span>
                                        <span className="px-3 py-1 bg-green-600/30 text-green-300 rounded-full text-sm">
                                            Aman
                                        </span>
                                        <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm">
                                            24/7
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="rounded-2xl shadow-lg p-6 mb-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <StepIndicator
                                step={1}
                                title="Data Pelanggan"
                                isActive={activeStep >= 1}
                                isComplete={isAccountComplete()}
                            />
                            <div className="flex-1 h-px bg-gray-700"></div>
                            <StepIndicator
                                step={2}
                                title="Cek Tagihan"
                                isActive={activeStep >= 2}
                                isComplete={!!pascabayarData.inquiryData}
                            />
                            <div className="flex-1 h-px bg-gray-700"></div>
                            <StepIndicator
                                step={3}
                                title="Pilih Produk"
                                isActive={activeStep >= 3}
                                isComplete={!!selectedProduct}
                            />
                            <div className="flex-1 h-px bg-gray-700"></div>
                            <StepIndicator
                                step={4}
                                title="Metode Bayar"
                                isActive={activeStep >= 4}
                                isComplete={!!paymentMethod}
                            />
                            <div className="flex-1 h-px bg-gray-700"></div>
                            <StepIndicator
                                step={5}
                                title="Data Pembeli"
                                isActive={activeStep >= 5}
                                isComplete={!!waPembeli}
                            />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="lg:flex lg:space-x-8">
                            {/* Left Column - Form (70%) */}
                            <div className="lg:w-8/12 space-y-8">
                                {/* Step 1: Data Pelanggan */}
                                <div className="rounded-2xl shadow-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
                                    <div className="p-8">
                                        <div className="flex items-center mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center mr-4 shadow-lg">
                                                <span className="text-white font-bold text-xl">
                                                    1
                                                </span>
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-100">
                                                    Data Pelanggan
                                                </h2>
                                                <p className="text-gray-400">
                                                    Masukkan data pelanggan{" "}
                                                    {game.name}
                                                </p>
                                            </div>
                                        </div>
                                        {renderAccountInputs()}
                                    </div>
                                </div>

                                {/* Step 2: Pilih Produk (jika sudah ada data tagihan) */}
                                {pascabayarData.inquiryData && (
                                    <div className="rounded-2xl shadow-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
                                        <div className="p-8">
                                            <div className="flex items-center mb-6">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 flex items-center justify-center mr-4 shadow-lg">
                                                    <span className="text-white font-bold text-xl">
                                                        2
                                                    </span>
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-100">
                                                        Pilih Produk
                                                    </h2>
                                                    <p className="text-gray-400">
                                                        Pilih produk {game.name}{" "}
                                                        yang sesuai
                                                    </p>
                                                </div>
                                            </div>
                                            {renderProducts()}
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Metode Pembayaran (jika sudah pilih produk) */}
                                {selectedProduct && (
                                    <div className="rounded-2xl shadow-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
                                        <div className="p-8">
                                            <div className="flex items-center mb-6">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-600 to-green-800 flex items-center justify-center mr-4 shadow-lg">
                                                    <span className="text-white font-bold text-xl">
                                                        3
                                                    </span>
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-100">
                                                        Metode Pembayaran
                                                    </h2>
                                                    <p className="text-gray-400">
                                                        Pilih metode pembayaran
                                                        yang diinginkan
                                                    </p>
                                                </div>
                                            </div>
                                            {renderPaymentMethods()}
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Data Pembeli */}
                                {paymentMethod && (
                                    <div className="rounded-2xl shadow-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
                                        <div className="p-8">
                                            <div className="flex items-center mb-6">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-800 flex items-center justify-center mr-4 shadow-lg">
                                                    <span className="text-white font-bold text-xl">
                                                        4
                                                    </span>
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-100">
                                                        Data Pembeli
                                                    </h2>
                                                    <p className="text-gray-400">
                                                        Masukkan data WhatsApp
                                                        untuk notifikasi
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="p-4 rounded-xl bg-yellow-900/20 border border-yellow-800/30">
                                                    <div className="flex items-start">
                                                        <svg
                                                            className="w-6 h-6 text-yellow-400 mr-3 mt-0.5 flex-shrink-0"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                        <p className="text-gray-300 text-sm">
                                                            Nomor WhatsApp akan
                                                            digunakan untuk
                                                            mengirimkan bukti
                                                            pembayaran dan
                                                            notifikasi status
                                                            transaksi.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-200">
                                                        Nomor WhatsApp
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
                                                            <span className="text-gray-400 font-medium">
                                                                +62
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            className="w-full px-4 py-3 pl-16 border rounded-xl focus:outline-none focus:ring-2 transition bg-gray-900/50 text-gray-100 border-gray-700 focus:border-green-500 focus:ring-green-500/30"
                                                            placeholder="81234567890"
                                                            value={waPembeli}
                                                            onChange={(e) =>
                                                                setWaPembeli(
                                                                    e.target.value
                                                                        .replace(
                                                                            /\D/g,
                                                                            ""
                                                                        )
                                                                        .slice(
                                                                            0,
                                                                            13
                                                                        )
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Contoh: 81234567890
                                                        (tanpa +62, tanpa 0)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Order Summary (30%) */}
                            <div className="lg:w-4/12">
                                <div className="lg:sticky lg:top-8 space-y-8">
                                    {/* Cara Pembelian */}
                                    <div className="rounded-2xl shadow-lg bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-6">
                                        <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                                            <svg
                                                className="w-5 h-5 mr-2 text-blue-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            Cara Pembelian
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                                    <span className="text-white text-xs font-bold">
                                                        1
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-300">
                                                    Masukkan nomor
                                                    pelanggan/pemilik meteran
                                                </p>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                                    <span className="text-white text-xs font-bold">
                                                        2
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-300">
                                                    Klik "Cek Tagihan" untuk
                                                    melihat detail tagihan
                                                </p>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                                    <span className="text-white text-xs font-bold">
                                                        3
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-300">
                                                    Pilih metode pembayaran dan
                                                    isi data WhatsApp
                                                </p>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                                    <span className="text-white text-xs font-bold">
                                                        4
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-300">
                                                    Bayar sesuai instruksi yang
                                                    diberikan
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="rounded-2xl sticky shadow-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 overflow-hidden">
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-100 mb-6">
                                                Rincian Pembayaran
                                            </h3>

                                            <div className="space-y-4">
                                                {/* Service Info */}
                                                <div className="pb-4 border-b border-gray-700">
                                                    <div className="flex items-center">
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-600 p-2 mr-3 bg-gray-900">
                                                            <img
                                                                src={`${appUrl}/storage/${game.logo}`}
                                                                alt={game.name}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-100">
                                                                {game.name}
                                                            </h4>
                                                            <p className="text-xs text-gray-400">
                                                                Pascabayar
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Customer Info */}
                                                {isAccountComplete() && (
                                                    <div className="pb-4 border-b border-gray-700">
                                                        <p className="text-xs text-gray-400 mb-1">
                                                            Nomor Pelanggan
                                                        </p>
                                                        <p className="text-sm font-mono font-semibold text-gray-200 break-all">
                                                            {formatCustomerNo()}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Bill Details */}
                                                {pascabayarData.billDetails && (
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-gray-400">
                                                                Tagihan Pokok
                                                            </span>
                                                            <span className="text-sm font-medium text-gray-200">
                                                                <FormatRupiah
                                                                    value={
                                                                        pascabayarData
                                                                            .billDetails
                                                                            .amount
                                                                    }
                                                                />
                                                            </span>
                                                        </div>

                                                        {pascabayarData
                                                            .billDetails.admin >
                                                            0 && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-400">
                                                                    Biaya Admin
                                                                </span>
                                                                <span className="text-sm font-medium text-gray-200">
                                                                    <FormatRupiah
                                                                        value={
                                                                            pascabayarData
                                                                                .billDetails
                                                                                .admin
                                                                        }
                                                                    />
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="pt-3 border-t border-gray-700">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-gray-300 font-medium">
                                                                    Subtotal
                                                                </span>
                                                                <span className="font-bold text-gray-200">
                                                                    <FormatRupiah
                                                                        value={
                                                                            pascabayarData
                                                                                .billDetails
                                                                                .total
                                                                        }
                                                                    />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Payment Fee */}
                                                {paymentMethod &&
                                                    calculateTotalFee() > 0 && (
                                                        <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                                                            <span className="text-sm text-gray-400">
                                                                Biaya Layanan
                                                                {paymentMethod.percentase_fee >
                                                                    0 &&
                                                                    ` (${paymentMethod.percentase_fee}%)`}
                                                            </span>
                                                            <span className="text-sm font-medium text-red-300">
                                                                +{" "}
                                                                <FormatRupiah
                                                                    value={calculateTotalFee()}
                                                                />
                                                            </span>
                                                        </div>
                                                    )}

                                                {/* Payment Method */}
                                                {paymentMethod && (
                                                    <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                                                        <span className="text-sm text-gray-400">
                                                            Metode Bayar
                                                        </span>
                                                        <div className="flex items-center">
                                                            <div className="w-6 h-6 rounded overflow-hidden mr-2 bg-white p-0.5">
                                                                <img
                                                                    src={`${appUrl}/storage/${paymentMethod.logo}`}
                                                                    alt={
                                                                        paymentMethod.name
                                                                    }
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-200 uppercase">
                                                                {
                                                                    paymentMethod.name
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Total */}
                                                <div className="pt-4">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <span className="text-lg font-bold text-gray-100">
                                                                Total Bayar
                                                            </span>
                                                            <p className="text-xs text-gray-500">
                                                                Sudah termasuk
                                                                semua biaya
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-green-400">
                                                                <FormatRupiah
                                                                    value={calculateTotalPayment()}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Submit Button */}
                                                <div className="pt-6">
                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            !isFormComplete
                                                        }
                                                        className={`w-full py-4 rounded-xl transition-all duration-300 font-bold text-lg ${
                                                            isFormComplete
                                                                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                                                                : "bg-gray-700 text-gray-500 cursor-not-allowed"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-center">
                                                            <svg
                                                                className="w-6 h-6 mr-3"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth="2"
                                                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                                />
                                                            </svg>
                                                            {isFormComplete
                                                                ? "BAYAR SEKARANG"
                                                                : "LENGKAPI DATA"}
                                                        </div>
                                                    </button>

                                                    {!isFormComplete && (
                                                        <p className="text-xs text-center text-gray-500 mt-3">
                                                            Silakan lengkapi
                                                            semua data terlebih
                                                            dahulu
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Security Info */}
                                                <div className="pt-4 text-center">
                                                    <div className="flex items-center justify-center text-xs text-gray-500">
                                                        <svg
                                                            className="w-4 h-4 mr-1"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                            />
                                                        </svg>
                                                        <span>
                                                            Transaksi aman dan
                                                            terenkripsi
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} {game.name} Pascabayar
                            Service. All rights reserved.
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            Proses pembayaran aman dan dilindungi
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default PascaBayar;
