import { useEffect, useState } from "react";
import axios from "axios";
import Authenticated from "@/Layouts/AuthenticatedLayout";

export default function Index({ auth, title }) {
    const [services, setServices] = useState([]);
    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const [logoPreview, setLogoPreview] = useState(null);
    const [iconPreview, setIconPreview] = useState(null);

    const initialForm = {
        name: "",
        slug: "",
        category: "",
        customer_no_format: "satu_input",
        example_format: "",

        field1_label: "User ID",
        field1_placeholder: "Masukkan User ID",

        field2_label: "",
        field2_placeholder: "",

        description: "",
        how_to_topup: "",
        notes: "",

        is_active: true,
        is_popular: false,

        logo: null,
        icon: null,
    };

    const [form, setForm] = useState(initialForm);

    /* ================= FETCH ================= */
    const fetchServices = async (q = "") => {
        setLoading(true);
        const res = await axios.get("/api/services", {
            params: { search: q },
        });
        setServices(res.data);
        setLoading(false);
    };

    useEffect(() => {
        fetchServices();
    }, []);

    /* ================= AUTO SLUG ================= */
    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            slug: prev.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""),
        }));
    }, [form.name]);

    /* ================= HANDLE CHANGE ================= */
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === "file") {
            const file = files[0];
            setForm({ ...form, [name]: file });

            if (name === "logo" && file) {
                setLogoPreview(URL.createObjectURL(file));
            }
            if (name === "icon" && file) {
                setIconPreview(URL.createObjectURL(file));
            }
            return;
        }

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    /* ================= MODAL ================= */
    const openAddModal = () => {
        setForm(initialForm);
        setEditingId(null);
        setErrors({});
        setLogoPreview(null);
        setIconPreview(null);
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setForm({
            ...item,
            logo: null,
            icon: null,
        });
        setEditingId(item.id);
        setLogoPreview(item.logo_url || null);
        setIconPreview(item.icon_url || null);
        setErrors({});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setForm(initialForm);
        setErrors({});
        setLogoPreview(null);
        setIconPreview(null);
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});
        setSuccess("");
        setError("");

        try {
            const data = new FormData();

            Object.keys(form).forEach((key) => {
                if (key === "is_active" || key === "is_popular") {
                    data.append(key, form[key] ? 1 : 0);
                } else if (form[key] !== null && form[key] !== "") {
                    data.append(key, form[key]);
                }
            });

            if (editingId) {
                await axios.patch(`/api/services/${editingId}`, data);
                setSuccess("Service berhasil diperbarui");
            } else {
                await axios.post("/api/services", data);
                setSuccess("Service berhasil ditambahkan");
            }

            closeModal();
            fetchServices(search);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setError("Terjadi kesalahan sistem");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Authenticated user={auth.user}>
            <div className="p-6 space-y-6">
                {/* Notifications */}
                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
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
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
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
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {title}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Kelola layanan dan produk yang tersedia
                        </p>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
                    >
                        <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v16m8-8H4"
                            ></path>
                        </svg>
                        Tambah Service
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        ></path>
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari service..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => fetchServices(search)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cari
                        </button>
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
                                        Nama Service
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Kategori
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Popular
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="5"
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
                                ) : services.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            <div className="flex flex-col items-center">
                                                <svg
                                                    className="w-16 h-16 text-gray-300 mb-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                                    ></path>
                                                </svg>
                                                <p className="text-lg font-medium text-gray-400">
                                                    Tidak ada data service
                                                </p>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    Mulai dengan menambahkan
                                                    service baru
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    services.map((service) => (
                                        <tr
                                            key={service.id}
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {service.logo_url ? (
                                                            <img
                                                                className="h-10 w-10 rounded-md object-cover"
                                                                src={
                                                                    service.logo_url
                                                                }
                                                                alt={
                                                                    service.name
                                                                }
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                                                                <span className="text-blue-600 font-semibold text-sm">
                                                                    {service.name
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {service.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {service.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {service.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        service.is_active
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {service.is_active
                                                        ? "Aktif"
                                                        : "Nonaktif"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {service.is_popular ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        Popular
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() =>
                                                        openEditModal(service)
                                                    }
                                                    className="text-blue-600 hover:text-blue-900 inline-flex items-center px-3 py-1 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-150"
                                                >
                                                    <svg
                                                        className="w-4 h-4 mr-1"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        ></path>
                                                    </svg>
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {services.length > 0 && (
                        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Menampilkan{" "}
                                    <span className="font-medium">
                                        {services.length}
                                    </span>{" "}
                                    service
                                </div>
                                <div className="flex space-x-2">
                                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                        Sebelumnya
                                    </button>
                                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL - Design Improved */}
                {showModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            {/* Background Overlay */}
                            <div
                                className="fixed inset-0 transition-opacity"
                                aria-hidden="true"
                            >
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>

                            {/* Modal Content */}
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                                {/* Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {editingId
                                                ? "Edit Service"
                                                : "Tambah Service Baru"}
                                        </h3>
                                        <button
                                            onClick={closeModal}
                                            type="button"
                                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                        >
                                            <svg
                                                className="h-6 w-6"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M6 18L18 6M6 6l12 12"
                                                ></path>
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Lengkapi form berikut untuk{" "}
                                        {editingId
                                            ? "memperbarui"
                                            : "menambahkan"}{" "}
                                        service
                                    </p>
                                </div>

                                {/* Form */}
                                <form
                                    onSubmit={handleSubmit}
                                    className="bg-white"
                                >
                                    <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                                        {/* Error Messages */}
                                        {Object.keys(errors).length > 0 && (
                                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                                <h4 className="text-sm font-medium text-red-800 mb-2">
                                                    Perbaiki kesalahan berikut:
                                                </h4>
                                                <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                                                    {Object.entries(errors).map(
                                                        ([field, messages]) => (
                                                            <li key={field}>
                                                                {messages.join(
                                                                    ", "
                                                                )}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Basic Information */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Nama Service *
                                                    </label>
                                                    <input
                                                        name="name"
                                                        value={form.name}
                                                        onChange={handleChange}
                                                        placeholder="Contoh: Steam Wallet"
                                                        className={`block w-full px-3 py-2 border ${
                                                            errors.name
                                                                ? "border-red-300"
                                                                : "border-gray-300"
                                                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                                    />
                                                    {errors.name && (
                                                        <p className="mt-1 text-sm text-red-600">
                                                            {errors.name[0]}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Slug
                                                    </label>
                                                    <input
                                                        value={form.slug}
                                                        disabled
                                                        className="block w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md shadow-sm sm:text-sm text-gray-500"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Slug otomatis dibuat
                                                        dari nama
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Kategori *
                                                    </label>
                                                    <input
                                                        name="category"
                                                        value={form.category}
                                                        onChange={handleChange}
                                                        placeholder="Contoh: Game, Voucher, etc"
                                                        className={`block w-full px-3 py-2 border ${
                                                            errors.category
                                                                ? "border-red-300"
                                                                : "border-gray-300"
                                                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                                    />
                                                    {errors.category && (
                                                        <p className="mt-1 text-sm text-red-600">
                                                            {errors.category[0]}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Format Input Customer
                                                    </label>
                                                    <select
                                                        name="customer_no_format"
                                                        value={
                                                            form.customer_no_format
                                                        }
                                                        onChange={handleChange}
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    >
                                                        <option value="satu_input">
                                                            Satu Input
                                                        </option>
                                                        <option value="dua_input">
                                                            Dua Input
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* File Uploads */}
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Logo Service
                                                    </label>
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex-shrink-0">
                                                            {logoPreview ? (
                                                                <img
                                                                    src={
                                                                        logoPreview
                                                                    }
                                                                    alt="Logo preview"
                                                                    className="h-16 w-16 rounded-md object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-16 w-16 rounded-md bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                                    <svg
                                                                        className="h-8 w-8 text-gray-400"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                        ></path>
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <input
                                                                type="file"
                                                                name="logo"
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                accept="image/*"
                                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                            />
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                Format: JPG,
                                                                PNG. Maks: 2MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Icon Service
                                                    </label>
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex-shrink-0">
                                                            {iconPreview ? (
                                                                <img
                                                                    src={
                                                                        iconPreview
                                                                    }
                                                                    alt="Icon preview"
                                                                    className="h-16 w-16 rounded-md object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-16 w-16 rounded-md bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                                    <svg
                                                                        className="h-8 w-8 text-gray-400"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                                                                        ></path>
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <input
                                                                type="file"
                                                                name="icon"
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                accept="image/*"
                                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                            />
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                Format: JPG,
                                                                PNG. Maks: 2MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Checkboxes */}
                                                <div className="pt-4 space-y-3">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            name="is_active"
                                                            checked={
                                                                form.is_active
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <label className="ml-2 block text-sm text-gray-900">
                                                            Aktif
                                                        </label>
                                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                            Service dapat
                                                            digunakan oleh
                                                            customer
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            name="is_popular"
                                                            checked={
                                                                form.is_popular
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <label className="ml-2 block text-sm text-gray-900">
                                                            Popular
                                                        </label>
                                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                            Ditampilkan di
                                                            halaman utama
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Field Inputs */}
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                                                Field Input Customer
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Label Field 1
                                                    </label>
                                                    <input
                                                        name="field1_label"
                                                        value={
                                                            form.field1_label
                                                        }
                                                        onChange={handleChange}
                                                        placeholder="Contoh: User ID"
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Placeholder Field 1
                                                    </label>
                                                    <input
                                                        name="field1_placeholder"
                                                        value={
                                                            form.field1_placeholder
                                                        }
                                                        onChange={handleChange}
                                                        placeholder="Contoh: Masukkan User ID"
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    />
                                                </div>
                                            </div>

                                            {form.customer_no_format ===
                                                "dua_input" && (
                                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Label Field 2
                                                        </label>
                                                        <input
                                                            name="field2_label"
                                                            value={
                                                                form.field2_label
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            placeholder="Contoh: Server ID"
                                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Placeholder Field 2
                                                        </label>
                                                        <input
                                                            name="field2_placeholder"
                                                            value={
                                                                form.field2_placeholder
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            placeholder="Contoh: Masukkan Server ID"
                                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Text Areas */}
                                        <div className="mt-6 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Deskripsi
                                                </label>
                                                <textarea
                                                    name="description"
                                                    value={form.description}
                                                    onChange={handleChange}
                                                    placeholder="Deskripsi singkat tentang service..."
                                                    rows="3"
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Cara Topup
                                                </label>
                                                <textarea
                                                    name="how_to_topup"
                                                    value={form.how_to_topup}
                                                    onChange={handleChange}
                                                    placeholder="Petunjuk cara melakukan topup..."
                                                    rows="3"
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Catatan
                                                </label>
                                                <textarea
                                                    name="notes"
                                                    value={form.notes}
                                                    onChange={handleChange}
                                                    placeholder="Catatan tambahan untuk service..."
                                                    rows="3"
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
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
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg
                                                            className="-ml-1 mr-2 h-4 w-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M5 13l4 4L19 7"
                                                            ></path>
                                                        </svg>
                                                        Simpan Service
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Authenticated>
    );
}
