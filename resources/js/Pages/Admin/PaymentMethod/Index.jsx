import FormatRupiah from "@/Components/FormatRupiah";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import {
    PenIcon,
    PlusCircleIcon,
    SearchIcon,
    Trash2Icon,
    XIcon,
    UploadIcon,
    AlertCircleIcon,
} from "lucide-react";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import FormatRupiahInput from "@/Components/FormatRupiahInput";
import axios from "axios";

const Index = ({ auth, paymentMethod }) => {
    const [filteredData, setFilteredData] = useState(paymentMethod);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const [data, setData] = useState({
        id: "",
        name: "",
        percentase_fee: "",
        nominal_fee: "",
        type: "",
        logo: null,
        logo_preview: "",
        status: "",
    });

    let [modalType, setModalType] = useState("");
    let [isOpen, setIsOpen] = useState(false);

    // Search functionality
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);

        if (value === "") {
            setFilteredData(paymentMethod);
        } else {
            const filtered = paymentMethod.filter(
                (method) =>
                    method.name.toLowerCase().includes(value) ||
                    method.type.toLowerCase().includes(value) ||
                    method.status.toLowerCase().includes(value)
            );
            setFilteredData(filtered);
        }
    };

    function handleChange(e) {
        const id = e.target.id;
        const value = e.target.value;

        setData({
            ...data,
            [id]: value,
        });
    }

    function handleLogoChange(e) {
        const file = e.target.files[0];
        if (file) {
            // Validasi ukuran file (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError("Ukuran file maksimal 2MB");
                setTimeout(() => setError(""), 3000);
                return;
            }

            // Validasi tipe file
            const validTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/gif",
                "image/svg+xml",
            ];
            if (!validTypes.includes(file.type)) {
                setError("Format file harus JPG, PNG, GIF, atau SVG");
                setTimeout(() => setError(""), 3000);
                return;
            }

            setData({
                ...data,
                logo: file,
                logo_preview: URL.createObjectURL(file),
            });
        }
    }

    function removeLogo() {
        setData({
            ...data,
            logo: null,
            logo_preview: "",
        });
    }

    function handleOpenModal(e, method) {
        setModalType(e);
        setError("");
        setSuccess("");

        if (e === "Edit Payment Method" && method) {
            setIsOpen(!isOpen);
            setData({
                id: method.id,
                name: method.name,
                percentase_fee: method.percentase_fee,
                nominal_fee: method.nominal_fee,
                type: method.type,
                logo: null,
                logo_preview: method.logo || "",
                status: method.status,
            });
        } else {
            setIsOpen(!isOpen);
            setData({
                id: "",
                name: "",
                percentase_fee: "",
                nominal_fee: "",
                type: "",
                logo: null,
                logo_preview: "",
                status: "",
            });
        }
    }

    function handleDelete(method) {
        if (
            window.confirm(`Apakah Anda yakin ingin menghapus ${method.name}?`)
        ) {
            setLoading(true);
            axios
                .delete(`/admin/payment-method/${method.id}`)
                .then(() => {
                    setFilteredData((prev) =>
                        prev.filter((item) => item.id !== method.id)
                    );
                    setSuccess(
                        `Payment method ${method.name} berhasil dihapus`
                    );
                    setTimeout(() => setSuccess(""), 3000);
                })
                .catch((err) => {
                    console.log(err);
                    setError("Gagal menghapus payment method");
                    setTimeout(() => setError(""), 3000);
                })
                .finally(() => setLoading(false));
        }
    }

    return (
        <>
            <Authenticated
                user={auth.user}
                header={
                    <div className="justify-between flex">
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Payment Method
                        </h2>
                        <button
                            onClick={() =>
                                handleOpenModal("Add Payment Method")
                            }
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            <PlusCircleIcon className="w-4 h-4 mr-2" />
                            Add Payment Method
                        </button>
                    </div>
                }
            >
                <Modal
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    data={data}
                    handleChange={handleChange}
                    handleLogoChange={handleLogoChange}
                    removeLogo={removeLogo}
                    modalType={modalType}
                    filteredData={filteredData}
                    setFilteredData={setFilteredData}
                    setSuccess={setSuccess}
                    setError={setError}
                />

                <Head title="Payment Methods" />

                <div className="py-8">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        {/* Success/Error Alerts */}
                        {success && (
                            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-5 w-5 text-green-500"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-green-700">
                                            {success}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-5 w-5 text-red-500"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Search and Stats */}
                        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                                <div className="flex-1">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <SearchIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={handleSearch}
                                            placeholder="Search by name, type, or status..."
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
                                    Total:{" "}
                                    <span className="font-semibold">
                                        {filteredData.length}
                                    </span>{" "}
                                    payment methods
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                #
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Payment Method
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Type
                                            </th>
                                            <th
                                                scope="col"
                                                className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Fees
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Status
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {loading ? (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    className="px-6 py-12 text-center"
                                                >
                                                    <div className="flex justify-center items-center">
                                                        <svg
                                                            className="animate-spin h-8 w-8 text-blue-600"
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
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredData.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    className="px-6 py-12 text-center text-gray-500"
                                                >
                                                    <div className="flex flex-col items-center">
                                                        <SearchIcon className="w-16 h-16 text-gray-300 mb-4" />
                                                        <p className="text-lg font-medium text-gray-400">
                                                            No payment methods
                                                            found
                                                        </p>
                                                        <p className="text-sm text-gray-400 mt-1">
                                                            {search
                                                                ? "Try different search terms"
                                                                : "Start by adding a payment method"}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredData.map((method, i) => (
                                                <tr
                                                    key={method.id}
                                                    className="hover:bg-gray-50 transition-colors duration-150"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {i + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                {method.logo ? (
                                                                    <img
                                                                        className="h-10 w-10 rounded-md object-cover"
                                                                        src={
                                                                            method.logo
                                                                        }
                                                                        alt={
                                                                            method.name
                                                                        }
                                                                        onError={(
                                                                            e
                                                                        ) => {
                                                                            e.target.onerror =
                                                                                null;
                                                                            e.target.parentElement.innerHTML = `
                                                                                <div class="h-10 w-10 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                                                                                    <span class="text-white font-semibold text-sm">
                                                                                        ${method.name
                                                                                            .charAt(
                                                                                                0
                                                                                            )
                                                                                            .toUpperCase()}
                                                                                    </span>
                                                                                </div>
                                                                            `;
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                                                                        <span className="text-white font-semibold text-sm">
                                                                            {method.name
                                                                                .charAt(
                                                                                    0
                                                                                )
                                                                                .toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 uppercase">
                                                                    {
                                                                        method.name
                                                                    }
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    ID:{" "}
                                                                    {method.id}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                method.type ===
                                                                "bank_transfer"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : method.type ===
                                                                      "ewallet"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : method.type ===
                                                                      "qris"
                                                                    ? "bg-purple-100 text-purple-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }`}
                                                        >
                                                            {method.type ===
                                                            "bank_transfer"
                                                                ? "Bank Transfer"
                                                                : method.type ===
                                                                  "ewallet"
                                                                ? "E-Wallet"
                                                                : method.type ===
                                                                  "qris"
                                                                ? "QRIS"
                                                                : method.type ===
                                                                  "cc"
                                                                ? "Credit Card"
                                                                : method.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            <span className="font-semibold">
                                                                {
                                                                    method.percentase_fee
                                                                }
                                                                %
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            <FormatRupiah
                                                                value={
                                                                    method.nominal_fee
                                                                }
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                method.status ===
                                                                "on"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-red-100 text-red-800"
                                                            }`}
                                                        >
                                                            {method.status ===
                                                            "on"
                                                                ? "ACTIVE"
                                                                : "INACTIVE"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleOpenModal(
                                                                        "Edit Payment Method",
                                                                        method
                                                                    )
                                                                }
                                                                className="inline-flex items-center px-3 py-1.5 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                                                            >
                                                                <PenIcon className="w-4 h-4 mr-1" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        method
                                                                    )
                                                                }
                                                                className="inline-flex items-center px-3 py-1.5 border border-red-600 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                                                            >
                                                                <Trash2Icon className="w-4 h-4 mr-1" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </Authenticated>
        </>
    );
};

function Modal({
    data,
    isOpen,
    setIsOpen,
    closeable = true,
    onClose = () => setIsOpen(false),
    handleChange,
    handleLogoChange,
    removeLogo,
    modalType,
    filteredData,
    setFilteredData,
    setSuccess,
    setError,
}) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const [submitting, setSubmitting] = useState(false);

    function handleSubmit() {
        if (
            !data.name ||
            !data.nominal_fee ||
            !data.percentase_fee ||
            !data.type ||
            !data.status
        ) {
            setError("Semua field wajib diisi!");
            setTimeout(() => setError(""), 3000);
            return;
        }

        setSubmitting(true);

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("nominal_fee", data.nominal_fee);
        formData.append("percentase_fee", data.percentase_fee);
        formData.append("type", data.type);
        formData.append("status", data.status);

        // Hanya append logo jika ada file baru
        if (data.logo instanceof File) {
            formData.append("logo", data.logo);
        }

        const url =
            modalType === "Edit Payment Method"
                ? `/admin/payment-method/${data.id}`
                : "/admin/payment-method";

        if (modalType === "Edit Payment Method") {
            // Untuk update, gunakan POST dengan _method=PUT
            formData.append("_method", "PUT");
            axios
                .post(url, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((response) => {
                    setFilteredData((prev) =>
                        prev.map((item) =>
                            item.id === data.id ? response.data : item
                        )
                    );
                    setSuccess(
                        `Payment method ${data.name} berhasil diperbarui`
                    );
                    setTimeout(() => setSuccess(""), 3000);
                    close();
                })
                .catch((err) => {
                    console.log("Error details:", err);
                    handleError(err);
                })
                .finally(() => setSubmitting(false));
        } else {
            // Untuk create, langsung POST
            axios
                .post(url, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((response) => {
                    setFilteredData([...filteredData, response.data]);
                    setSuccess(
                        `Payment method ${data.name} berhasil ditambahkan`
                    );
                    setTimeout(() => setSuccess(""), 3000);
                    close();
                })
                .catch((err) => {
                    console.log("Error details:", err);
                    handleError(err);
                })
                .finally(() => setSubmitting(false));
        }
    }

    function handleError(err) {
        if (err.response?.data?.errors) {
            const errorMessages = Object.values(err.response.data.errors)
                .flat()
                .join(", ");
            setError(`Validation error: ${errorMessages}`);
        } else if (err.response?.data?.message) {
            setError(err.response.data.message);
        } else {
            setError(
                `Gagal ${
                    modalType === "Edit Payment Method"
                        ? "memperbarui"
                        : "menambahkan"
                } payment method`
            );
        }
        setTimeout(() => setError(""), 5000);
    }

    return (
        <Transition show={isOpen} as={Fragment} leave="duration-200">
            <Dialog
                as="div"
                className="fixed inset-0 z-50 overflow-y-auto"
                onClose={close}
            >
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <span
                        className="hidden sm:inline-block sm:align-middle sm:h-screen"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>

                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <div
                            className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full`}
                        >
                            {/* Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Dialog.Title className="text-lg font-medium text-gray-900">
                                            {modalType}
                                        </Dialog.Title>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {modalType === "Edit Payment Method"
                                                ? "Perbarui informasi payment method"
                                                : "Tambahkan payment method baru"}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                        onClick={close}
                                    >
                                        <XIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-6">
                                    {/* Logo Upload */}
                                    <div>
                                        <InputLabel value="Logo Payment Method" />
                                        <div className="mt-1">
                                            {data.logo_preview ? (
                                                <div className="space-y-2">
                                                    <div className="relative w-32 h-32">
                                                        <div className="w-full h-full rounded-lg overflow-hidden border border-gray-300">
                                                            <img
                                                                src={
                                                                    data.logo_preview
                                                                }
                                                                alt="Logo preview"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={removeLogo}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                        >
                                                            <XIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {data.logo instanceof
                                                        File
                                                            ? `File baru: ${data.logo.name}`
                                                            : modalType ===
                                                              "Edit Payment Method"
                                                            ? "Logo existing akan dipertahankan"
                                                            : ""}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                                    <div className="space-y-1 text-center">
                                                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                        <div className="flex text-sm text-gray-600">
                                                            <label
                                                                htmlFor="logo"
                                                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                                            >
                                                                <span>
                                                                    Upload logo
                                                                </span>
                                                                <input
                                                                    id="logo"
                                                                    name="logo"
                                                                    type="file"
                                                                    className="sr-only"
                                                                    accept="image/*"
                                                                    onChange={
                                                                        handleLogoChange
                                                                    }
                                                                />
                                                            </label>
                                                            <p className="pl-1">
                                                                or drag and drop
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            PNG, JPG, GIF, SVG
                                                            up to 2MB
                                                        </p>
                                                        {modalType ===
                                                            "Edit Payment Method" &&
                                                            data.logo_preview ===
                                                                "" && (
                                                                <p className="text-xs text-gray-400 mt-2">
                                                                    Kosongkan
                                                                    untuk
                                                                    mempertahankan
                                                                    logo yang
                                                                    ada
                                                                </p>
                                                            )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <InputLabel value="Name *" />
                                        <TextInput
                                            id="name"
                                            value={data.name || ""}
                                            onChange={handleChange}
                                            className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            type="text"
                                            placeholder="Enter payment method name"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="Percentage Fee (%) *" />
                                            <TextInput
                                                id="percentase_fee"
                                                value={
                                                    data.percentase_fee || ""
                                                }
                                                onChange={handleChange}
                                                className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel value="Nominal Fee *" />
                                            <FormatRupiahInput
                                                id="nominal_fee"
                                                value={data.nominal_fee || ""}
                                                onChange={handleChange}
                                                className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="Type *" />
                                            <select
                                                id="type"
                                                value={data.type || ""}
                                                onChange={handleChange}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-2 px-3"
                                            >
                                                <option value="">
                                                    -- Select Type --
                                                </option>
                                                <option value="cc">
                                                    Credit Card
                                                </option>
                                                <option value="bank_transfer">
                                                    Bank Transfer/VA
                                                </option>
                                                <option value="ewallet">
                                                    E-Wallet
                                                </option>
                                                <option value="qris">
                                                    QRIS
                                                </option>
                                            </select>
                                        </div>

                                        <div>
                                            <InputLabel value="Status *" />
                                            <select
                                                id="status"
                                                value={data.status || ""}
                                                onChange={handleChange}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-2 px-3"
                                            >
                                                <option value="">
                                                    -- Select Status --
                                                </option>
                                                <option value="on">
                                                    ACTIVE
                                                </option>
                                                <option value="off">
                                                    INACTIVE
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={close}
                                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                                {modalType ===
                                                "Edit Payment Method"
                                                    ? "Updating..."
                                                    : "Saving..."}
                                            </>
                                        ) : modalType ===
                                          "Edit Payment Method" ? (
                                            "Update Payment Method"
                                        ) : (
                                            "Save Payment Method"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}

export default Index;
