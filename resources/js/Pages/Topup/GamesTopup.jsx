import FormatRupiah from "@/Components/FormatRupiah";
import AppLayout from "@/Layouts/AppLayout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { createInertiaApp } from "@inertiajs/react";

const GamesTopup = ({
    products,
    payment,
    appUrl,
    game,
    formatConfig,
    exampleFormat,
}) => {
    // === COLOR PALETTE DARK THEME ===
    const COLORS = {
        primary: "#1F2937", // Dark Gray
        secondary: "#374151", // Medium Gray
        accent: "#4B5563", // Soft Gray
        surface: "#111827", // Very Dark Gray
        light: "#F9FAFB", // Light text on dark
        success: "#10B981", // Emerald Green
        warning: "#F59E0B", // Amber
        error: "#EF4444", // Red
        info: "#3B82F6", // Blue
        purple: "#8B5CF6", // Purple for Data category
        pink: "#EC4899", // Pink for Game Voucher
    };

    // State untuk data akun
    const [accountData, setAccountData] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [waPembeli, setWaPembeli] = useState("");
    const [activeStep, setActiveStep] = useState(1);
    const [activeCategory, setActiveCategory] = useState("all");
    const [isCheckingPln, setIsCheckingPln] = useState(false);
    const [plnData, setPlnData] = useState(null);
    const [plnError, setPlnError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    // Cek apakah ini produk PLN
    const isPlnProduct = game.category === "pln";

    // Fungsi untuk mendapatkan semua kategori yang tersedia
    const getAvailableCategories = () => {
        const categories = {};

        products.forEach((product) => {
            const cat = product.category || "Lainnya";
            if (!categories[cat]) {
                categories[cat] = 0;
            }
            categories[cat]++;
        });

        return Object.entries(categories).map(([category, count]) => {
            let key = category.toLowerCase().replace(/\s+/g, "_");
            let color = COLORS.accent;
            let icon = (
                <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2 2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                </svg>
            );

            // Custom untuk kategori tertentu
            if (category === "Pulsa") {
                key = "pulsa";
                color = COLORS.success;
                icon = (
                    <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                    </svg>
                );
            } else if (category === "Data") {
                key = "data";
                color = COLORS.purple;
                icon = (
                    <svg
                        className="w-4 h-4 mr-2"
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
                );
            } else if (category === "Token Listrik") {
                key = "token_listrik";
                color = COLORS.warning;
                icon = (
                    <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                    </svg>
                );
            } else if (category === "Voucher Game") {
                key = "voucher_game";
                color = COLORS.pink;
                icon = (
                    <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                        />
                    </svg>
                );
            }

            return {
                key,
                label: category,
                count,
                color,
                icon,
            };
        });
    };

    // Cek apakah perlu menampilkan tab (hanya untuk Pulsa dan Data)
    const shouldShowTabs = () => {
        const hasPulsa = products.some((p) => p.category === "Pulsa");
        const hasData = products.some((p) => p.category === "Data");
        return hasPulsa || hasData;
    };

    // Fungsi untuk mengelompokkan produk berdasarkan provider
    const groupProductsByProvider = (productList) => {
        const groups = {};

        productList.forEach((product) => {
            let provider = "Umum";
            const productName = product.product_name?.toLowerCase() || "";

            // Deteksi provider berdasarkan nama produk
            if (
                productName.includes("telkomsel") ||
                productName.includes("tsel") ||
                productName.includes("simpati")
            ) {
                provider = "Telkomsel";
            } else if (
                productName.includes("xl") ||
                productName.includes("x-lite")
            ) {
                provider = "XL";
            } else if (
                productName.includes("indosat") ||
                productName.includes("im3") ||
                productName.includes("mentari")
            ) {
                provider = "Indosat";
            } else if (
                productName.includes("tri") ||
                productName.includes("3")
            ) {
                provider = "Tri";
            } else if (productName.includes("smartfren")) {
                provider = "Smartfren";
            } else if (productName.includes("axis")) {
                provider = "Axis";
            } else if (
                productName.includes("by.u") ||
                productName.includes("byu")
            ) {
                provider = "By.U";
            }

            if (!groups[provider]) {
                groups[provider] = {
                    provider,
                    products: [],
                };
            }

            groups[provider].products.push(product);
        });

        // Urutkan provider
        const sortedProviders = Object.keys(groups).sort();
        return sortedProviders.map((provider) => groups[provider]);
    };

    // Fungsi untuk mendapatkan icon provider
    const getProviderIcon = (provider) => {
        const icons = {
            Telkomsel: (
                <span className="text-red-400 font-bold text-xs">TSEL</span>
            ),
            XL: <span className="text-blue-400 font-bold text-xs">XL</span>,
            Indosat: (
                <span className="text-green-400 font-bold text-xs">IM3</span>
            ),
            Tri: <span className="text-purple-400 font-bold text-xs">3</span>,
            Smartfren: (
                <span className="text-yellow-400 font-bold text-xs">SF</span>
            ),
            Axis: <span className="text-pink-400 font-bold text-xs">AX</span>,
            "By.U": (
                <span className="text-indigo-400 font-bold text-xs">BY</span>
            ),
        };

        return (
            icons[provider] || (
                <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                </svg>
            )
        );
    };

    // Render produk berdasarkan kategori aktif
    const renderProducts = () => {
        let filteredProducts = products;

        if (activeCategory === "pulsa") {
            filteredProducts = products.filter((p) => p.category === "Pulsa");
        } else if (activeCategory === "data") {
            filteredProducts = products.filter((p) => p.category === "Data");
        } else if (activeCategory !== "all") {
            // Cari kategori berdasarkan key
            const categoryData = getAvailableCategories().find(
                (cat) => cat.key === activeCategory
            );
            if (categoryData) {
                filteredProducts = products.filter(
                    (p) => p.category === categoryData.label
                );
            }
        }

        if (filteredProducts.length === 0) {
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

        // Jika produknya adalah Pulsa atau Data, kelompokkan berdasarkan provider
        if (activeCategory === "pulsa" || activeCategory === "data") {
            const groupedProducts = groupProductsByProvider(filteredProducts);

            return (
                <div className="space-y-6">
                    {groupedProducts.map((group) => (
                        <div key={group.provider} className="space-y-3">
                            <div className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2 ${
                                        activeCategory === "pulsa"
                                            ? "bg-emerald-900/30"
                                            : "bg-purple-900/30"
                                    }`}
                                >
                                    {getProviderIcon(group.provider)}
                                </div>
                                <h4 className="font-semibold text-gray-200 text-lg">
                                    {group.provider}
                                </h4>
                            </div>
                            <div
                                className={`${
                                    activeCategory === "pulsa"
                                        ? "grid-cols-2"
                                        : ""
                                } grid md:grid-cols-3 lg:grid-cols-4 gap-3`}
                            >
                                {group.products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        selectedProduct={selectedProduct}
                                        onSelect={setSelectedProduct}
                                        color={
                                            activeCategory === "pulsa"
                                                ? COLORS.success
                                                : COLORS.purple
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // Untuk kategori lain, tampilkan langsung tanpa grouping
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        selectedProduct={selectedProduct}
                        onSelect={setSelectedProduct}
                        color={COLORS.accent}
                    />
                ))}
            </div>
        );
    };

    // Komponen ProductCard yang reusable
    const ProductCard = ({ product, selectedProduct, onSelect, color }) => {
        const isSelected = selectedProduct?.id === product.id;

        return (
            <div
                className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:transform hover:-translate-y-1 ${
                    isSelected
                        ? "shadow-lg scale-105 border-opacity-100"
                        : "border-gray-700 hover:border-gray-500 border-opacity-50"
                }`}
                onClick={() => onSelect(product)}
                style={{
                    backgroundColor: isSelected
                        ? `${color}20`
                        : COLORS.secondary,
                    borderColor: isSelected ? color : "transparent",
                }}
            >
                {isSelected && (
                    <div
                        className="absolute -top-2 -right-2 text-white text-xs font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: color }}
                    >
                        ✓
                    </div>
                )}
                <div className="font-bold text-gray-100 mb-2 line-clamp-2">
                    {product.product_name}
                </div>
                <div className="text-lg font-bold text-white">
                    <FormatRupiah value={product.selling_price} />
                </div>
                {product.description && (
                    <div className="text-xs text-gray-400 mt-2 line-clamp-2">
                        {product.description}
                    </div>
                )}
            </div>
        );
    };

    // Format customer number berdasarkan format game
    const formatCustomerNo = () => {
        if (!game) return "";

        // Untuk satu_input, ambil field1
        if (game.customer_no_format === "satu_input") {
            return accountData.field1 || "";
        }

        // Untuk dua_input, gabungkan field1 dan field2 dengan separator
        if (game.customer_no_format === "dua_input") {
            const field1 = accountData.field1 || "";
            const field2 = accountData.field2 || "";
            const separator = game.separator || "";

            // Jika hanya satu field yang diisi, return field itu saja
            if (field1 && !field2) return field1;
            if (!field1 && field2) return field2;

            // Jika keduanya diisi, gabungkan dengan separator
            if (field1 && field2) {
                return `${field1}${separator}${field2}`;
            }

            return "";
        }

        return "";
    };

    // Cek apakah akun sudah lengkap
    const isAccountComplete = () => {
        if (!game) return false;

        if (game.customer_no_format === "satu_input") {
            return accountData.field1 && accountData.field1.trim() !== "";
        }

        if (game.customer_no_format === "dua_input") {
            // Untuk dua_input, keduanya wajib diisi
            return (
                accountData.field1 &&
                accountData.field1.trim() !== "" &&
                accountData.field2 &&
                accountData.field2.trim() !== ""
            );
        }

        return false;
    };

    // Fungsi untuk check PLN (dijalankan saat nomor meteran berubah)
    const checkPln = async (customerNo) => {
        if (!customerNo || customerNo.length < 10) return;

        setIsCheckingPln(true);
        setPlnError(null);
        setPlnData(null);

        try {
            const response = await axios.post(`/api/inquiry-pln`, {
                customer_no: customerNo,
                category: game.category,
            });

            if (response.data.success) {
                setPlnData(response.data.data);
            } else {
                setPlnError(response.data.message);
            }
        } catch (error) {
            console.error("PLN inquiry error:", error);
            setPlnError("Gagal memeriksa nomor PLN");
        } finally {
            setIsCheckingPln(false);
        }
    };

    // Effect untuk auto check PLN saat nomor meteran berubah
    useEffect(() => {
        if (isPlnProduct) {
            const customerNo = formatCustomerNo();

            // Debounce untuk menghindari terlalu banyak request
            const timeoutId = setTimeout(() => {
                if (customerNo && customerNo.length >= 10) {
                    checkPln(customerNo);
                }
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [accountData, isPlnProduct]);

    // Cek apakah form lengkap
    useEffect(() => {
        let isValid = false;

        // Untuk PLN, cek juga apakah data inquiry sudah ada
        if (isPlnProduct) {
            isValid =
                isAccountComplete() &&
                plnData && // PLN data harus ada
                selectedProduct &&
                paymentMethod &&
                waPembeli;
        } else {
            isValid =
                isAccountComplete() &&
                selectedProduct &&
                paymentMethod &&
                waPembeli;
        }

        setIsFormComplete(isValid);
    }, [
        accountData,
        selectedProduct,
        paymentMethod,
        waPembeli,
        isPlnProduct,
        plnData,
    ]);

    // Update active step berdasarkan kondisi
    useEffect(() => {
        if (isAccountComplete()) {
            setActiveStep(2);
        }
        if (selectedProduct) {
            setActiveStep(3);
        }
        if (paymentMethod) {
            setActiveStep(4);
        }
        if (waPembeli) {
            setActiveStep(5);
        }
    }, [isAccountComplete(), selectedProduct, paymentMethod, waPembeli]);

    // Handle perubahan input akun
    const handleAccountChange = (fieldKey, value) => {
        // Hapus spasi dan karakter khusus
        const cleanedValue = value.replace(/\s+/g, "");

        setAccountData((prev) => ({
            ...prev,
            [fieldKey]: cleanedValue,
        }));
    };

    // Render input fields berdasarkan format game
    const renderAccountInputs = () => {
        return (
            <div className="space-y-4">
                {/* Preview jika sudah ada data */}
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
                                    Data akun sudah terisi
                                </p>
                                <p className="text-gray-300 text-sm font-mono break-all">
                                    {formatCustomerNo()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Field 1 (selalu ada) */}
                <div className="space-y-2">
                    <label
                        className="block text-sm font-medium text-gray-200"
                        htmlFor="field1"
                    >
                        {game.field1_label || "Field 1"} *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="field1"
                            className="w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 transition bg-gray-800 text-gray-100 border-gray-700 focus:border-blue-500 focus:ring-blue-500/30"
                            placeholder={
                                game.field1_placeholder ||
                                `Masukkan ${
                                    game.field1_label?.toLowerCase() || "data"
                                }`
                            }
                            value={accountData.field1 || ""}
                            onChange={(e) =>
                                handleAccountChange("field1", e.target.value)
                            }
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

                {/* Field 2 (hanya untuk dua_input) */}
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
                                    `Masukkan ${
                                        game.field2_label?.toLowerCase() ||
                                        "data"
                                    }`
                                }
                                value={accountData.field2 || ""}
                                onChange={(e) =>
                                    handleAccountChange(
                                        "field2",
                                        e.target.value
                                    )
                                }
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

                {/* Tombol Check PLN (jika produk PLN) */}
                {isPlnProduct && isAccountComplete() && (
                    <button
                        type="button"
                        onClick={() => {
                            const customerNo = formatCustomerNo();
                            if (customerNo) checkPln(customerNo);
                        }}
                        disabled={isCheckingPln}
                        className="mt-2 px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isCheckingPln ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Checking...
                            </>
                        ) : (
                            "Cek Tagihan PLN"
                        )}
                    </button>
                )}

                {/* Tampilkan data PLN jika ada */}
                {isPlnProduct && plnData && (
                    <div
                        className="mt-4 rounded-lg p-4"
                        style={{
                            backgroundColor: COLORS.success + "10",
                            border: `1px solid ${COLORS.success}30`,
                        }}
                    >
                        <h4 className="font-semibold text-gray-100 mb-2">
                            Informasi Tagihan PLN
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">
                                    Nama Pelanggan:
                                </span>
                                <span className="text-sm font-medium text-gray-200">
                                    {plnData.name && plnData.name.length > 3
                                        ? plnData.name.substring(0, 3) + "xxxx"
                                        : plnData.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">
                                    No meter:
                                </span>
                                <span className="text-sm font-medium text-gray-200">
                                    {plnData.meter_no}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-400">
                                    Power:
                                </span>
                                <span
                                    className="text-sm font-medium"
                                    style={{ color: COLORS.success }}
                                >
                                    {plnData.segment_power}
                                </span>
                            </div>
                            {plnData.admin > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-400">
                                        Biaya Admin:
                                    </span>
                                    <span className="text-sm font-medium text-gray-200">
                                        <FormatRupiah value={plnData.admin} />
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tampilkan error PLN jika ada */}
                {isPlnProduct && plnError && (
                    <div
                        className="mt-4 rounded-lg p-4"
                        style={{
                            backgroundColor: COLORS.error + "10",
                            border: `1px solid ${COLORS.error}30`,
                        }}
                    >
                        <p className="text-sm" style={{ color: COLORS.error }}>
                            {plnError}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isFormComplete) {
            alert("Mohon lengkapi semua data terlebih dahulu.");
            return;
        }

        const customerNo = formatCustomerNo();

        // Siapkan data untuk dikirim
        const data = {
            id: selectedProduct.id,
            buyer_sku_code: selectedProduct.buyer_sku_code,
            product_name: selectedProduct.product_name,
            selling_price: selectedProduct.selling_price,
            gross_amount: calculateTotalPayment(),
            fee: calculateTotalFee(),
            paymentMethod: paymentMethod.name,
            customer_no: customerNo,
            payment_type: paymentMethod.payment_type,
            wa_pembeli: waPembeli,
            customer_format: game.customer_no_format,
            // Untuk dua_input, kirim juga field individual jika diperlukan
            ...(game.customer_no_format === "dua_input" && {
                field1: accountData.field1,
                field2: accountData.field2,
                separator: game.separator,
            }),
        };

        // Tambahkan data PLN jika ada
        if (isPlnProduct && plnData) {
            data.pln_data = plnData;
        }

        console.log("Data yang dikirim:", data);

        axios
            .post("/api/midtrans/transaction", data)
            .then((res) => {
                console.log(res);
                if (res.data.data?.transaction_status === "pending") {
                    const orderId = res.data.data.order_id;
                    window.location.href = `/history/${orderId}`;
                } else {
                    console.log("Payment created successfully:", res.data);
                }
            })
            .catch((error) => {
                console.error("Error creating payment:", error.response);
                alert("Terjadi kesalahan dalam membuat pembayaran");
            });
    };

    // Komponen Step Indicator
    const StepIndicator = ({ step, title, isActive, isComplete, onClick }) => {
        return (
            <div
                className={`flex items-center cursor-pointer ${
                    onClick ? "hover:opacity-80 transition" : ""
                }`}
                onClick={onClick}
            >
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

    // Fungsi untuk menghitung total pembayaran (ditambah untuk PLN)
    const calculateTotalPayment = () => {
        if (!selectedProduct) return 0;

        const productPrice = Number(selectedProduct.selling_price) || 0;
        let totalFee = 0;

        if (paymentMethod) {
            // Hitung biaya persentase
            if (paymentMethod.percentase_fee > 0) {
                totalFee += (productPrice * paymentMethod.percentase_fee) / 100;
            }
            // Hitung biaya nominal
            totalFee += Number(paymentMethod.nominal_fee) || 0;
        }

        // Untuk PLN, tambahkan tagihan jika ada
        if (isPlnProduct && plnData) {
            const plnBill = Number(plnData.bill) || 0;
            const plnAdmin = Number(plnData.admin) || 0;
            return plnBill + plnAdmin + totalFee;
        }

        return productPrice + totalFee;
    };

    console.log(calculateTotalPayment());

    // Fungsi untuk menghitung total biaya saja
    const calculateTotalFee = () => {
        if (!paymentMethod || !selectedProduct) return 0;

        const productPrice = Number(selectedProduct.selling_price) || 0;
        let totalFee = 0;

        // Hitung biaya persentase
        if (paymentMethod.percentase_fee > 0) {
            totalFee += (productPrice * paymentMethod.percentase_fee) / 100;
        }
        // Hitung biaya nominal
        totalFee += Number(paymentMethod.nominal_fee) || 0;

        return totalFee;
    };

    // Auto set active category jika hanya ada satu jenis kategori
    useEffect(() => {
        const categories = getAvailableCategories();

        // Jika hanya ada 1 kategori atau tidak ada kategori Pulsa/Data
        if (categories.length === 1) {
            setActiveCategory(categories[0].key);
        } else if (
            categories.some(
                (cat) => cat.label === "Pulsa" || cat.label === "Data"
            )
        ) {
            // Jika ada Pulsa atau Data, set default ke Pulsa jika ada
            if (categories.some((cat) => cat.label === "Pulsa")) {
                setActiveCategory("pulsa");
            } else if (categories.some((cat) => cat.label === "Data")) {
                setActiveCategory("data");
            }
        }
    }, [products]);

    return (
        <AppLayout>
            <div className="min-h-screen">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Header dengan Game Info */}
                    <div
                        className="rounded-2xl shadow-xl overflow-hidden mb-6 transform transition duration-300 hover:shadow-2xl"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        <div
                            className="p-6 md:p-8"
                            style={{
                                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary}, ${COLORS.accent})`,
                            }}
                        >
                            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                                <div className="relative">
                                    <img
                                        src={`${appUrl}/storage/${game.logo}`}
                                        alt={`${game.name} Logo`}
                                        className="w-24 h-24 md:w-28 md:h-28 rounded-xl shadow-2xl object-cover border-4 border-white/20 transform rotate-3 hover:rotate-0 transition-transform duration-300"
                                    />
                                    <div
                                        className="absolute -bottom-2 -right-2 text-white text-xs font-bold px-3 py-1 rounded-full"
                                        style={{
                                            background: `linear-gradient(135deg, ${COLORS.warning}, ${COLORS.accent})`,
                                        }}
                                    >
                                        TOP UP
                                    </div>
                                </div>
                                <div className="text-center md:text-left">
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                        {game.name}
                                    </h1>
                                    <p className="text-gray-300 text-lg">
                                        {isPlnProduct
                                            ? "Bayar tagihan listrik dengan mudah"
                                            : game.description ||
                                              "Top up dengan cepat, aman, dan terpercaya"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="lg:flex lg:space-x-6">
                            {/* Bagian Kiri - Form Input (70% di PC) */}
                            <div className="lg:w-8/12">
                                {/* Bagian 1: Data Akun / Nomor Meteran PLN */}
                                <div
                                    className="rounded-2xl shadow-lg mb-6"
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    <div className="p-6 md:p-8">
                                        <div className="flex items-center mb-6">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
                                                style={{
                                                    background: `linear-gradient(135deg, ${COLORS.info}, ${COLORS.secondary})`,
                                                }}
                                            >
                                                <span className="text-white font-bold">
                                                    1
                                                </span>
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-100">
                                                {isPlnProduct
                                                    ? "Nomor Meteran PLN"
                                                    : `Data Akun ${game.name}`}
                                            </h2>
                                        </div>
                                        <div className="space-y-6">
                                            {renderAccountInputs()}
                                        </div>
                                    </div>
                                </div>

                                {/* Bagian 2: Pilih Nominal/Token */}
                                <div
                                    className="rounded-2xl shadow-lg mb-6"
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    <div className="p-6 md:p-8">
                                        <div className="flex items-center mb-6">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
                                                style={{
                                                    background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.secondary})`,
                                                }}
                                            >
                                                <span className="text-white font-bold">
                                                    2
                                                </span>
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-100">
                                                {isPlnProduct
                                                    ? "Pilih Token Listrik"
                                                    : "Pilih Nominal"}
                                            </h2>
                                        </div>

                                        {/* Tampilkan tab hanya jika ada produk Pulsa atau Data */}
                                        {shouldShowTabs() ? (
                                            <div className="space-y-6">
                                                {/* Tab Navigasi untuk Pulsa dan Data */}
                                                <div
                                                    className="flex border-b"
                                                    style={{
                                                        borderColor:
                                                            COLORS.secondary,
                                                    }}
                                                >
                                                    {products.some(
                                                        (p) =>
                                                            p.category ===
                                                            "Pulsa"
                                                    ) && (
                                                        <button
                                                            type="button"
                                                            className={`flex-1 px-4 py-3 font-medium text-sm transition-colors relative`}
                                                            onClick={() => {
                                                                setActiveCategory(
                                                                    "pulsa"
                                                                );
                                                                setSelectedProduct(
                                                                    null
                                                                );
                                                            }}
                                                            style={{
                                                                color:
                                                                    activeCategory ===
                                                                    "pulsa"
                                                                        ? COLORS.success
                                                                        : "#9CA3AF",
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-center">
                                                                <svg
                                                                    className="w-4 h-4 mr-2"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                                    />
                                                                </svg>
                                                                Pulsa
                                                                <span
                                                                    className="ml-2 text-xs px-2 py-1 rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            COLORS.success +
                                                                            "20",
                                                                        color: COLORS.success,
                                                                    }}
                                                                >
                                                                    {
                                                                        products.filter(
                                                                            (
                                                                                p
                                                                            ) =>
                                                                                p.category ===
                                                                                "Pulsa"
                                                                        ).length
                                                                    }
                                                                </span>
                                                            </div>
                                                            {activeCategory ===
                                                                "pulsa" && (
                                                                <div
                                                                    className="absolute bottom-0 left-0 right-0 h-0.5"
                                                                    style={{
                                                                        backgroundColor:
                                                                            COLORS.success,
                                                                    }}
                                                                />
                                                            )}
                                                        </button>
                                                    )}

                                                    {products.some(
                                                        (p) =>
                                                            p.category ===
                                                            "Data"
                                                    ) && (
                                                        <button
                                                            type="button"
                                                            className={`flex-1 px-4 py-3 font-medium text-sm transition-colors relative`}
                                                            onClick={() => {
                                                                setActiveCategory(
                                                                    "data"
                                                                );
                                                                setSelectedProduct(
                                                                    null
                                                                );
                                                            }}
                                                            style={{
                                                                color:
                                                                    activeCategory ===
                                                                    "data"
                                                                        ? COLORS.purple
                                                                        : "#9CA3AF",
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-center">
                                                                <svg
                                                                    className="w-4 h-4 mr-2"
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
                                                                Paket Data
                                                                <span
                                                                    className="ml-2 text-xs px-2 py-1 rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            COLORS.purple +
                                                                            "20",
                                                                        color: COLORS.purple,
                                                                    }}
                                                                >
                                                                    {
                                                                        products.filter(
                                                                            (
                                                                                p
                                                                            ) =>
                                                                                p.category ===
                                                                                "Data"
                                                                        ).length
                                                                    }
                                                                </span>
                                                            </div>
                                                            {activeCategory ===
                                                                "data" && (
                                                                <div
                                                                    className="absolute bottom-0 left-0 right-0 h-0.5"
                                                                    style={{
                                                                        backgroundColor:
                                                                            COLORS.purple,
                                                                    }}
                                                                />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Konten Tab */}
                                                <div className="min-h-[300px]">
                                                    {renderProducts()}
                                                </div>
                                            </div>
                                        ) : (
                                            /* Jika tidak ada Pulsa/Data, langsung render semua produk */
                                            renderProducts()
                                        )}
                                    </div>
                                </div>

                                {/* Bagian 3: Pilih Pembayaran */}
                                <div
                                    className="rounded-2xl shadow-lg mb-6"
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    <div className="p-6 md:p-8">
                                        <div className="flex items-center mb-6">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
                                                style={{
                                                    background: `linear-gradient(135deg, ${COLORS.pink}, ${COLORS.secondary})`,
                                                }}
                                            >
                                                <span className="text-white font-bold">
                                                    3
                                                </span>
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-100">
                                                Pilih Metode Pembayaran
                                            </h2>
                                        </div>

                                        <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-4">
                                            {payment.map((method) => {
                                                // Kalkulasi total harga
                                                let totalPrice = 0;

                                                if (selectedProduct) {
                                                    const productPrice = Number(
                                                        selectedProduct.selling_price ??
                                                            0
                                                    );
                                                    let percentFee = 0;
                                                    if (
                                                        method.percentase_fee &&
                                                        method.percentase_fee >
                                                            0
                                                    ) {
                                                        percentFee =
                                                            (productPrice *
                                                                method.percentase_fee) /
                                                            100;
                                                    }
                                                    const nominalFee =
                                                        Number(
                                                            method.nominal_fee
                                                        ) || 0;
                                                    totalPrice =
                                                        productPrice +
                                                        percentFee +
                                                        nominalFee;
                                                }

                                                return (
                                                    <div
                                                        key={method.id}
                                                        className={`border-2 rounded-xl p-4 flex items-center cursor-pointer transition-all duration-300 hover:shadow-lg hover:transform hover:-translate-y-1 ${
                                                            paymentMethod?.id ===
                                                            method.id
                                                                ? "shadow-lg scale-105"
                                                                : ""
                                                        }`}
                                                        onClick={() =>
                                                            setPaymentMethod(
                                                                method
                                                            )
                                                        }
                                                        style={{
                                                            backgroundColor:
                                                                paymentMethod?.id ===
                                                                method.id
                                                                    ? COLORS.secondary
                                                                    : COLORS.primary,
                                                            borderColor:
                                                                paymentMethod?.id ===
                                                                method.id
                                                                    ? COLORS.success
                                                                    : COLORS.accent,
                                                            borderWidth: "2px",
                                                        }}
                                                    >
                                                        <div
                                                            className="flex items-center justify-center w-12 h-12 rounded-lg p-2 mr-4 shadow-sm"
                                                            style={{
                                                                backgroundColor:
                                                                    COLORS.surface,
                                                            }}
                                                        >
                                                            <img
                                                                className="w-full h-full object-contain"
                                                                src={`${appUrl}/storage/${method.logo}`}
                                                                alt={
                                                                    method.name
                                                                }
                                                            />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <div className="font-semibold text-gray-100 uppercase">
                                                                {method.name}
                                                            </div>
                                                            <div className="text-sm mt-1">
                                                                {selectedProduct && (
                                                                    <span
                                                                        className="font-bold"
                                                                        style={{
                                                                            color: COLORS.success,
                                                                        }}
                                                                    >
                                                                        <FormatRupiah
                                                                            value={
                                                                                totalPrice
                                                                            }
                                                                        />
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {paymentMethod?.id ===
                                                            method.id && (
                                                            <div
                                                                className="w-6 h-6 rounded-full flex items-center justify-center"
                                                                style={{
                                                                    backgroundColor:
                                                                        COLORS.success,
                                                                }}
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
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Bagian 4: Data Pembeli */}
                                <div
                                    className="rounded-2xl shadow-lg mb-6 lg:mb-0"
                                    style={{ backgroundColor: COLORS.primary }}
                                >
                                    <div className="p-6 md:p-8">
                                        <div className="flex items-center mb-6">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
                                                style={{
                                                    background: `linear-gradient(135deg, ${COLORS.warning}, ${COLORS.secondary})`,
                                                }}
                                            >
                                                <span className="text-white font-bold">
                                                    4
                                                </span>
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-100">
                                                Data Pembeli
                                            </h2>
                                        </div>

                                        <div className="space-y-6">
                                            <div
                                                className="rounded-xl p-4"
                                                style={{
                                                    backgroundColor:
                                                        COLORS.warning + "10",
                                                    border: `1px solid ${COLORS.warning}30`,
                                                }}
                                            >
                                                <div className="flex items-start">
                                                    <svg
                                                        className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        style={{
                                                            color: COLORS.warning,
                                                        }}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                        />
                                                    </svg>
                                                    <p className="text-sm text-white">
                                                        Nomor WhatsApp akan
                                                        digunakan untuk
                                                        notifikasi pembayaran
                                                        dan informasi transaksi.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-200">
                                                    Nomor WhatsApp
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                                                        <span className="text-gray-400">
                                                            +62
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        className="w-full px-4 py-3 pl-16 border rounded-lg focus:outline-none focus:ring-2 transition bg-gray-800 text-gray-100 border-gray-700 focus:border-green-500 focus:ring-green-500/30"
                                                        placeholder="81234567890"
                                                        value={waPembeli}
                                                        onChange={(e) =>
                                                            setWaPembeli(
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bagian Kanan - Konfirmasi Pembayaran */}
                            <div className="lg:w-4/12">
                                <div
                                    className="rounded-2xl shadow-lg overflow-hidden mb-4"
                                    style={{
                                        backgroundColor: COLORS.primary,
                                    }}
                                >
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-100 mb-4">
                                            Cara Pembelian
                                        </h3>

                                        {game.how_to_topup && (
                                            <div
                                                className="text-gray-300 prose prose-invert max-w-none"
                                                dangerouslySetInnerHTML={{
                                                    __html: game.how_to_topup,
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* ACCORDION CART */}
                                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
                                    <div className="max-w-7xl mx-auto px-4">
                                        <div
                                            className="rounded-2xl shadow-lg overflow-hidden"
                                            style={{
                                                backgroundColor: COLORS.primary,
                                            }}
                                        >
                                            {/* HEADER (CLICKABLE) */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsOpen(!isOpen)
                                                }
                                                className="w-full flex justify-between items-center p-4"
                                            >
                                                <span className="font-bold text-gray-100">
                                                    Konfirmasi Pembayaran
                                                </span>

                                                <svg
                                                    className={`w-5 h-5 text-gray-300 transition-transform duration-300 ${
                                                        isOpen
                                                            ? "rotate-180"
                                                            : ""
                                                    }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </button>

                                            {/* CONTENT (ACCORDION BODY) */}
                                            <div
                                                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                                    isOpen
                                                        ? "max-h-[90vh]"
                                                        : "max-h-0"
                                                }`}
                                            >
                                                <div className="p-4 pt-0">
                                                    {selectedProduct ? (
                                                        <>
                                                            <div
                                                                className="rounded-2xl shadow-lg overflow-hidden"
                                                                style={{
                                                                    backgroundColor:
                                                                        COLORS.primary,
                                                                }}
                                                            >
                                                                <div className="p-6">
                                                                    <h3 className="text-xl font-bold text-gray-100 mb-4">
                                                                        Konfirmasi
                                                                        Pembayaran
                                                                    </h3>

                                                                    <div
                                                                        className="border rounded-lg overflow-hidden"
                                                                        style={{
                                                                            borderColor:
                                                                                COLORS.secondary,
                                                                        }}
                                                                    >
                                                                        <div
                                                                            className="p-4 border-b"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    COLORS.secondary,
                                                                                borderColor:
                                                                                    COLORS.secondary,
                                                                            }}
                                                                        >
                                                                            <div className="flex items-center">
                                                                                <div
                                                                                    className="w-12 h-12 rounded-lg overflow-hidden border p-2 mr-3"
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            COLORS.surface,
                                                                                        borderColor:
                                                                                            COLORS.accent,
                                                                                    }}
                                                                                >
                                                                                    <img
                                                                                        src={`${appUrl}/storage/${game.logo}`}
                                                                                        alt={`${game.name} Logo`}
                                                                                        className="w-full h-full object-contain"
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <h4 className="font-bold text-gray-100">
                                                                                        {
                                                                                            game.name
                                                                                        }
                                                                                    </h4>
                                                                                    <p
                                                                                        className="text-xs"
                                                                                        style={{
                                                                                            color: COLORS.accent,
                                                                                        }}
                                                                                    >
                                                                                        {isPlnProduct
                                                                                            ? "Token Listrik"
                                                                                            : "Top Up Voucher"}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="p-4 space-y-3">
                                                                            {isAccountComplete() && (
                                                                                <div
                                                                                    className="pb-3 border-b"
                                                                                    style={{
                                                                                        borderColor:
                                                                                            COLORS.secondary,
                                                                                    }}
                                                                                >
                                                                                    <p className="text-xs text-gray-400 mb-1">
                                                                                        {isPlnProduct
                                                                                            ? "Nomor Meteran"
                                                                                            : "Akun Game"}
                                                                                    </p>
                                                                                    <p className="text-sm font-mono font-semibold break-all text-gray-200">
                                                                                        {formatCustomerNo()}
                                                                                    </p>
                                                                                </div>
                                                                            )}

                                                                            {/* Tampilkan info PLN jika ada */}
                                                                            {isPlnProduct &&
                                                                                plnData && (
                                                                                    <>
                                                                                        <div
                                                                                            className="pb-3 border-b"
                                                                                            style={{
                                                                                                borderColor:
                                                                                                    COLORS.secondary,
                                                                                            }}
                                                                                        >
                                                                                            <p className="text-xs text-gray-400 mb-1">
                                                                                                Nama
                                                                                                Pelanggan
                                                                                            </p>
                                                                                            <p className="text-sm font-semibold text-gray-200">
                                                                                                {
                                                                                                    plnData.nama
                                                                                                }
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className="text-sm text-gray-400">
                                                                                                Tagihan
                                                                                                Listrik
                                                                                            </span>
                                                                                            <span className="font-semibold text-gray-200">
                                                                                                <FormatRupiah
                                                                                                    value={Number(
                                                                                                        plnData.bill ||
                                                                                                            0
                                                                                                    )}
                                                                                                />
                                                                                            </span>
                                                                                        </div>
                                                                                        {plnData.admin >
                                                                                            0 && (
                                                                                            <div className="flex justify-between items-center">
                                                                                                <span className="text-sm text-gray-400">
                                                                                                    Biaya
                                                                                                    Admin
                                                                                                </span>
                                                                                                <span className="font-semibold text-gray-200">
                                                                                                    <FormatRupiah
                                                                                                        value={Number(
                                                                                                            plnData.admin ||
                                                                                                                0
                                                                                                        )}
                                                                                                    />
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                    </>
                                                                                )}

                                                                            {!isPlnProduct && (
                                                                                <div className="flex justify-between items-center">
                                                                                    <span className="text-sm text-gray-400">
                                                                                        {
                                                                                            selectedProduct.product_name
                                                                                        }
                                                                                    </span>
                                                                                    <span className="font-semibold text-white">
                                                                                        <FormatRupiah
                                                                                            value={Number(
                                                                                                selectedProduct.selling_price ||
                                                                                                    0
                                                                                            )}
                                                                                        />
                                                                                    </span>
                                                                                </div>
                                                                            )}

                                                                            {paymentMethod &&
                                                                                calculateTotalFee() >
                                                                                    0 && (
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span className="text-sm text-gray-400">
                                                                                            {paymentMethod.percentase_fee >
                                                                                            0
                                                                                                ? `Biaya Admin (${paymentMethod.percentase_fee}%)`
                                                                                                : "Biaya Layanan"}
                                                                                        </span>
                                                                                        <span
                                                                                            className="font-semibold"
                                                                                            style={{
                                                                                                color: COLORS.error,
                                                                                            }}
                                                                                        >
                                                                                            <FormatRupiah
                                                                                                value={calculateTotalFee()}
                                                                                            />
                                                                                        </span>
                                                                                    </div>
                                                                                )}

                                                                            {paymentMethod && (
                                                                                <div
                                                                                    className="flex justify-between items-center pt-2 border-t"
                                                                                    style={{
                                                                                        borderColor:
                                                                                            COLORS.secondary,
                                                                                    }}
                                                                                >
                                                                                    <span className="text-sm text-gray-400">
                                                                                        Metode
                                                                                        Bayar
                                                                                    </span>
                                                                                    <div className="flex items-center">
                                                                                        <div
                                                                                            className="w-5 h-5 mr-1 rounded overflow-hidden"
                                                                                            style={{
                                                                                                backgroundColor:
                                                                                                    COLORS.surface,
                                                                                            }}
                                                                                        >
                                                                                            <img
                                                                                                src={`${appUrl}/storage/${paymentMethod.logo}`}
                                                                                                alt={
                                                                                                    paymentMethod.name
                                                                                                }
                                                                                                className="w-full h-full object-contain"
                                                                                            />
                                                                                        </div>
                                                                                        <span className="text-sm font-semibold uppercase text-gray-200">
                                                                                            {
                                                                                                paymentMethod.name
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            <div
                                                                                className="flex justify-between items-center pt-3 border-t"
                                                                                style={{
                                                                                    borderColor:
                                                                                        COLORS.secondary,
                                                                                }}
                                                                            >
                                                                                <div>
                                                                                    <span className="text-lg font-bold text-gray-100">
                                                                                        Total
                                                                                    </span>
                                                                                    <p className="text-xs text-gray-400">
                                                                                        Sudah
                                                                                        termasuk
                                                                                        semua
                                                                                        biaya
                                                                                    </p>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <div
                                                                                        className="text-xl font-bold"
                                                                                        style={{
                                                                                            color: COLORS.success,
                                                                                        }}
                                                                                    >
                                                                                        <FormatRupiah
                                                                                            value={calculateTotalPayment()}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-4">
                                                                        <button
                                                                            type="submit"
                                                                            disabled={
                                                                                !isFormComplete
                                                                            }
                                                                            className={`w-full py-3 rounded-xl transition-all duration-300 transform font-bold text-lg ${
                                                                                isFormComplete
                                                                                    ? "text-white hover:scale-[1.02] shadow-lg hover:shadow-xl cursor-pointer"
                                                                                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                                                                            }`}
                                                                            style={
                                                                                isFormComplete
                                                                                    ? {
                                                                                          background: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.info})`,
                                                                                      }
                                                                                    : {}
                                                                            }
                                                                        >
                                                                            <div className="flex items-center justify-center">
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
                                                                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                                                    />
                                                                                </svg>
                                                                                {isFormComplete
                                                                                    ? "Bayar Sekarang"
                                                                                    : "Lengkapi Data"}
                                                                            </div>
                                                                        </button>
                                                                    </div>

                                                                    <div className="mt-4 text-center">
                                                                        <p className="text-xs text-gray-400">
                                                                            Proses
                                                                            aman
                                                                            dan
                                                                            terenkripsi
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div
                                                            className="rounded-xl p-6 text-center"
                                                            style={{
                                                                backgroundColor:
                                                                    COLORS.primary,
                                                                borderLeft: `2px solid ${COLORS.secondary}`,
                                                            }}
                                                        >
                                                            <h1
                                                                className="font-bold"
                                                                style={{
                                                                    color: COLORS.accent,
                                                                }}
                                                            >
                                                                Belum ada produk
                                                                yang dipilih
                                                            </h1>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:sticky sm:hi lg:top-6">
                                    {/* Bagian Konfirmasi Pembayaran */}
                                    {selectedProduct ? (
                                        <div
                                            className="rounded-2xl shadow-lg overflow-hidden"
                                            style={{
                                                backgroundColor: COLORS.primary,
                                            }}
                                        >
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-gray-100 mb-4">
                                                    Konfirmasi Pembayaran
                                                </h3>

                                                <div
                                                    className="border rounded-lg overflow-hidden"
                                                    style={{
                                                        borderColor:
                                                            COLORS.secondary,
                                                    }}
                                                >
                                                    <div
                                                        className="p-4 border-b"
                                                        style={{
                                                            backgroundColor:
                                                                COLORS.secondary,
                                                            borderColor:
                                                                COLORS.secondary,
                                                        }}
                                                    >
                                                        <div className="flex items-center">
                                                            <div
                                                                className="w-12 h-12 rounded-lg overflow-hidden border p-2 mr-3"
                                                                style={{
                                                                    backgroundColor:
                                                                        COLORS.surface,
                                                                    borderColor:
                                                                        COLORS.accent,
                                                                }}
                                                            >
                                                                <img
                                                                    src={`${appUrl}/storage/${game.logo}`}
                                                                    alt={`${game.name} Logo`}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-100">
                                                                    {game.name}
                                                                </h4>
                                                                <p
                                                                    className="text-xs"
                                                                    style={{
                                                                        color: COLORS.accent,
                                                                    }}
                                                                >
                                                                    {isPlnProduct
                                                                        ? "Token Listrik"
                                                                        : "Top Up Voucher"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 space-y-3">
                                                        {isAccountComplete() && (
                                                            <div
                                                                className="pb-3 border-b"
                                                                style={{
                                                                    borderColor:
                                                                        COLORS.secondary,
                                                                }}
                                                            >
                                                                <p className="text-xs text-gray-400 mb-1">
                                                                    {isPlnProduct
                                                                        ? "Nomor Meteran"
                                                                        : "Akun Game"}
                                                                </p>
                                                                <p className="text-sm font-mono font-semibold break-all text-gray-200">
                                                                    {formatCustomerNo()}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Tampilkan info PLN jika ada */}
                                                        {isPlnProduct &&
                                                            plnData && (
                                                                <>
                                                                    <div
                                                                        className="pb-3 border-b"
                                                                        style={{
                                                                            borderColor:
                                                                                COLORS.secondary,
                                                                        }}
                                                                    >
                                                                        <p className="text-xs text-gray-400 mb-1">
                                                                            Nama
                                                                            Pelanggan
                                                                        </p>
                                                                        <p className="text-sm font-semibold text-gray-200">
                                                                            {
                                                                                plnData.nama
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-sm text-gray-400">
                                                                            Tagihan
                                                                            Listrik
                                                                        </span>
                                                                        <span className="font-semibold text-gray-200">
                                                                            <FormatRupiah
                                                                                value={Number(
                                                                                    plnData.bill ||
                                                                                        0
                                                                                )}
                                                                            />
                                                                        </span>
                                                                    </div>
                                                                    {plnData.admin >
                                                                        0 && (
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-sm text-gray-400">
                                                                                Biaya
                                                                                Admin
                                                                            </span>
                                                                            <span className="font-semibold text-gray-200">
                                                                                <FormatRupiah
                                                                                    value={Number(
                                                                                        plnData.admin ||
                                                                                            0
                                                                                    )}
                                                                                />
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}

                                                        {!isPlnProduct && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-400">
                                                                    {
                                                                        selectedProduct.product_name
                                                                    }
                                                                </span>
                                                                <span className="font-semibold text-white">
                                                                    <FormatRupiah
                                                                        value={Number(
                                                                            selectedProduct.selling_price ||
                                                                                0
                                                                        )}
                                                                    />
                                                                </span>
                                                            </div>
                                                        )}

                                                        {paymentMethod &&
                                                            calculateTotalFee() >
                                                                0 && (
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm text-gray-400">
                                                                        {paymentMethod.percentase_fee >
                                                                        0
                                                                            ? `Biaya Admin (${paymentMethod.percentase_fee}%)`
                                                                            : "Biaya Layanan"}
                                                                    </span>
                                                                    <span
                                                                        className="font-semibold"
                                                                        style={{
                                                                            color: COLORS.error,
                                                                        }}
                                                                    >
                                                                        <FormatRupiah
                                                                            value={calculateTotalFee()}
                                                                        />
                                                                    </span>
                                                                </div>
                                                            )}

                                                        {paymentMethod && (
                                                            <div
                                                                className="flex justify-between items-center pt-2 border-t"
                                                                style={{
                                                                    borderColor:
                                                                        COLORS.secondary,
                                                                }}
                                                            >
                                                                <span className="text-sm text-gray-400">
                                                                    Metode Bayar
                                                                </span>
                                                                <div className="flex items-center">
                                                                    <div
                                                                        className="w-5 h-5 mr-1 rounded overflow-hidden"
                                                                        style={{
                                                                            backgroundColor:
                                                                                COLORS.surface,
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={`${appUrl}/storage/${paymentMethod.logo}`}
                                                                            alt={
                                                                                paymentMethod.name
                                                                            }
                                                                            className="w-full h-full object-contain"
                                                                        />
                                                                    </div>
                                                                    <span className="text-sm font-semibold uppercase text-gray-200">
                                                                        {
                                                                            paymentMethod.name
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div
                                                            className="flex justify-between items-center pt-3 border-t"
                                                            style={{
                                                                borderColor:
                                                                    COLORS.secondary,
                                                            }}
                                                        >
                                                            <div>
                                                                <span className="text-lg font-bold text-gray-100">
                                                                    Total
                                                                </span>
                                                                <p className="text-xs text-gray-400">
                                                                    Sudah
                                                                    termasuk
                                                                    semua biaya
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div
                                                                    className="text-xl font-bold"
                                                                    style={{
                                                                        color: COLORS.success,
                                                                    }}
                                                                >
                                                                    <FormatRupiah
                                                                        value={calculateTotalPayment()}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <button
                                                        type="submit"
                                                        disabled={
                                                            !isFormComplete
                                                        }
                                                        className={`w-full py-3 rounded-xl transition-all duration-300 transform font-bold text-lg ${
                                                            isFormComplete
                                                                ? "text-white hover:scale-[1.02] shadow-lg hover:shadow-xl cursor-pointer"
                                                                : "bg-gray-700 text-gray-500 cursor-not-allowed"
                                                        }`}
                                                        style={
                                                            isFormComplete
                                                                ? {
                                                                      background: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.info})`,
                                                                  }
                                                                : {}
                                                        }
                                                    >
                                                        <div className="flex items-center justify-center">
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
                                                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                                />
                                                            </svg>
                                                            {isFormComplete
                                                                ? "Bayar Sekarang"
                                                                : "Lengkapi Data"}
                                                        </div>
                                                    </button>
                                                </div>

                                                <div className="mt-4 text-center">
                                                    <p className="text-xs text-gray-400">
                                                        Proses aman dan
                                                        terenkripsi
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="rounded-2xl shadow-lg overflow-hidden p-6 py-10"
                                            style={{
                                                backgroundColor: COLORS.primary,
                                                borderLeft: `2px solid ${COLORS.secondary}`,
                                            }}
                                        >
                                            <div>
                                                <h1
                                                    className="text-center font-bold"
                                                    style={{
                                                        color: COLORS.accent,
                                                    }}
                                                >
                                                    Belum ada produk yang
                                                    dipilih
                                                </h1>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>

                    <div
                        className="mt-8 text-center text-sm"
                        style={{ color: COLORS.accent }}
                    >
                        <p>© by ARFENAZ MVA</p>
                        <p className="mt-1">Proses aman dan terenkripsi</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default GamesTopup;
