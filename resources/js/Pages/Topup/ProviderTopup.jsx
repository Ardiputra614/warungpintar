import FormatRupiah from "@/Components/FormatRupiah";
import AppLayout from "@/Layouts/AppLayout";
import React, { useState } from "react";

const ProviderTopup = ({ products, payment }) => {
    const [customer_no, setUserId] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [waPembeli, setWaPembeli] = useState("");

    // Metode pembayaran
    const [paymentMethods, setPaymentMethods] = useState(payment);

    // Cek apakah form lengkap
    React.useEffect(() => {
        if (customer_no && selectedProduct && paymentMethod && waPembeli) {
            setIsFormComplete(true);
        } else {
            setIsFormComplete(false);
        }
    }, [customer_no, selectedProduct, paymentMethod, waPembeli]);

    const [qr, setQr] = useState();
    const handleSubmit = (e) => {
        const data = {
            id: selectedProduct.id,
            buyer_sku_code: selectedProduct.buyer_sku_code,
            product_name: selectedProduct.product_name,
            selling_price: selectedProduct.selling_price,
            paymentMethod: paymentMethod.name,
            customer_no: customer_no,
            wa_pembeli: waPembeli,
        };

        e.preventDefault();
        if (isFormComplete) {
            console.log("data:", data);
            axios
                .post("/api/midtrans/transaction", data)
                .then((res) => {
                    console.log(res);
                    // Check if the status is pending
                    if (res.data.data.transaction_status === "pending") {
                        // Redirect to history page if status is pending
                        const orderId = res.data.data.order_id; // Ambil order_id dari response
                        window.location.href = `/history/${orderId}`;
                    } else {
                        // Handle successful response or another status
                        console.log("Payment created successfully:", res.data);
                    }
                })
                .catch((error) => {
                    // Handle error here
                    console.error("Error creating payment:", error.response);
                    alert("Terjadi kesalahan dalam membuat pembayaran");
                });
        } else {
            alert("Mohon lengkapi semua data terlebih dahulu.");
        }
    };

    const FormatRupiah = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AppLayout>
            {/* Main Content */}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Game Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center space-x-6">
                    <img
                        src="/api/placeholder/120/120"
                        alt="Mobile Legends Logo"
                        className="w-20 h-20 rounded-lg shadow-lg"
                    />
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            {products[0].brand}
                        </h1>
                        <p className="text-blue-100">
                            Top up {products[0].category} {products[0].brand}{" "}
                            dengan mudah dan cepat
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div>
                            {/* Kolom 1: Data Akun & Info Panduan */}
                            <div className="space-y-6 mb-2">
                                <div className="bg-white border rounded-lg p-6 shadow-sm">
                                    <h2 className="text-xl font-semibold mb-4">
                                        1. Data Akun
                                    </h2>

                                    <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm text-blue-700">
                                        <p>Pastikan Nomor benar</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                className="block text-gray-700 mb-2"
                                                htmlFor="user-id"
                                            >
                                                Nomor hp
                                            </label>
                                            <input
                                                type="number"
                                                id="nomor-hp"
                                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="08..."
                                                value={customer_no}
                                                onChange={(e) =>
                                                    setUserId(e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Info Panduan */}
                                {/* <div className="bg-white border rounded-lg p-6 shadow-sm">
                                    <h2 className="text-xl font-semibold mb-4">
                                        Cara Top Up
                                    </h2>
                                    <ol className="list-decimal ml-5 space-y-2 text-gray-700">
                                        <li>Masukkan User ID dan Server</li>
                                        <li>Pilih nominal Diamonds</li>
                                        <li>Pilih metode pembayaran</li>
                                        <li>Klik tombol "Bayar Sekarang"</li>
                                        <li>Diamonds akan masuk otomatis</li>
                                    </ol>
                                </div> */}
                            </div>

                            {/* Kolom 2: Pilih Nominal Diamonds */}
                            <div className="space-y-6 mb-2">
                                <div className="bg-white border rounded-lg p-6 shadow-sm">
                                    <h2 className="text-xl font-semibold mb-4">
                                        2. Pilih Nominal {products[0].category}
                                    </h2>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {products.map((product) => (
                                            <div
                                                key={product.id}
                                                className={`border rounded-lg p-3 cursor-pointer transition hover:shadow-md ${
                                                    selectedProduct?.id ===
                                                    product.id
                                                        ? "border-blue-500 bg-blue-50 shadow-md"
                                                        : "border-gray-200"
                                                }`}
                                                onClick={() =>
                                                    setSelectedProduct(product)
                                                }
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="font-medium">
                                                        {product.product_name}
                                                    </div>
                                                    {/* {product.bonus !== "0" && (
                                                        <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                                                            +{product.bonus}
                                                        </div>
                                                    )} */}
                                                </div>
                                                <div className="text-blue-600 font-semibold">
                                                    {/* {product.selling_price} */}
                                                    {FormatRupiah(
                                                        product.selling_price
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Informasi Produk Yang Dipilih */}
                                {selectedProduct && (
                                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                                        <h2 className="text-lg font-semibold mb-3">
                                            Produk Dipilih
                                        </h2>
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="flex justify-between mb-2">
                                                <div className="text-gray-600">
                                                    Nama Produk
                                                </div>
                                                <div className="font-medium">
                                                    {
                                                        selectedProduct.product_name
                                                    }
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <div className="text-gray-600">
                                                    Harga:
                                                </div>
                                                <div className="font-semibold text-blue-600">
                                                    {FormatRupiah(
                                                        selectedProduct.selling_price
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Kolom 3: Metode Pembayaran & Konfirmasi */}
                            <div className="space-y-6 mb-2">
                                <div className="bg-white border rounded-lg p-6 shadow-sm">
                                    <h2 className="text-xl font-semibold mb-4">
                                        3. Pilih Metode Pembayaran
                                    </h2>

                                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2 uppercase">
                                        {paymentMethods.map((method) => (
                                            <div
                                                key={method.id}
                                                className={`border rounded-lg p-4 flex items-center cursor-pointer hover:border-blue-500 transition ${
                                                    paymentMethod?.id ===
                                                    method.id
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200"
                                                }`}
                                                onClick={() =>
                                                    setPaymentMethod(method)
                                                }
                                            >
                                                <div className="bg-gray-100 p-2 rounded-md mr-4 w-12 h-12">
                                                    <img
                                                        src={`/storage/${method.logo}`}
                                                        className="object-cover justify-items-center"
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="font-medium">
                                                        {method.name}
                                                    </div>
                                                </div>
                                                {paymentMethod?.id ===
                                                    method.id && (
                                                    <svg
                                                        className="w-5 h-5 text-blue-600"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6 mb-2">
                                    <div className="bg-white border rounded-lg p-6 shadow-sm">
                                        <h2 className="text-xl font-semibold mb-4">
                                            4. Data Pembeli
                                        </h2>

                                        <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm text-blue-700">
                                            <p>
                                                Pastikan nomor sudah benar.
                                                Supaya medapat informasi
                                                berhasil dan lainnya
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label
                                                    className="block text-gray-700 mb-2"
                                                    htmlFor="user-id"
                                                >
                                                    No Whatsapp
                                                </label>
                                                <input
                                                    type="number"
                                                    id="user-id"
                                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="62..."
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

                                {/* Konfirmasi & Pembayaran */}
                                <div className="bg-white border rounded-lg p-6 shadow-sm">
                                    <h2 className="text-xl font-semibold mb-4">
                                        5. Konfirmasi & Pembayaran
                                    </h2>

                                    {customer_no &&
                                    selectedProduct &&
                                    paymentMethod ? (
                                        <div>
                                            <div className="border rounded-lg overflow-hidden mb-4">
                                                <div className="bg-gray-50 p-3 border-b">
                                                    <h3 className="font-medium">
                                                        Detail Pembelian
                                                    </h3>
                                                </div>
                                                <div className="p-4 space-y-2">
                                                    <div className="flex justify-between">
                                                        <div className="text-gray-600">
                                                            Nama Produk
                                                        </div>
                                                        <div>
                                                            {
                                                                selectedProduct.brand
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <div className="text-gray-600">
                                                            Nomor hp
                                                        </div>
                                                        <div>{customer_no}</div>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <div className="text-gray-600">
                                                            Produk
                                                        </div>
                                                        <div>
                                                            {
                                                                selectedProduct.product_name
                                                            }{" "}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <div className="text-gray-600">
                                                            Harga
                                                        </div>
                                                        <div className="font-semibold">
                                                            {FormatRupiah(
                                                                selectedProduct.selling_price
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <div className="text-gray-600">
                                                            Pembayaran
                                                        </div>
                                                        <div>
                                                            {paymentMethod.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800 mb-4">
                                                <p>
                                                    Dengan melanjutkan, Anda
                                                    menyetujui Syarat &
                                                    Ketentuan.
                                                </p>
                                            </div>

                                            <button
                                                onClick={handleSubmit}
                                                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                                            >
                                                Bayar Sekarang
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                                            <p className="text-gray-500 text-center">
                                                Silahkan lengkapi seluruh data
                                                pembayaran terlebih dahulu
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
};
export default ProviderTopup;
