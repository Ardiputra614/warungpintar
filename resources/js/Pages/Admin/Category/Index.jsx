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

const Index = ({ auth, categories, title }) => {
    const [filteredData, setFilteredData] = useState(categories);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const [data, setData] = useState({
        id: "",
        name: "",
        status: null, // BUKAN ""
    });

    let [modalType, setModalType] = useState("");
    let [isOpen, setIsOpen] = useState(false);

    // Search functionality
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);

        if (value === "") {
            setFilteredData(categories);
        } else {
            const filtered = categories.filter(
                (category) =>
                    category.name.toLowerCase().includes(value) ||
                    (category.status ? "active" : "inactive").includes(value)
            );
            setFilteredData(filtered);
        }
    };

    function handleChange(e) {
        const { id, value } = e.target;

        setData({
            ...data,
            [id]: id === "status" ? value : value,
        });
    }

    console.log(categories);

    function handleOpenModal(e, category) {
        console.log(category);
        setModalType(e);
        setError("");
        setSuccess("");

        if (e === "Edit Category" && category) {
            setIsOpen(true);
            setData({
                id: category.id,
                name: category.name,
                status: category.status ? "true" : "false",
            });
        } else {
            setIsOpen(true);
            setData({
                id: "",
                name: "",
                status: null,
            });
        }
    }

    function handleDelete(category) {
        if (
            window.confirm(
                `Apakah Anda yakin ingin menghapus ${category.name}?`
            )
        ) {
            setLoading(true);
            axios
                .delete(`/admin/category/${category.id}`)
                .then(() => {
                    setFilteredData((prev) =>
                        prev.filter((item) => item.id !== category.id)
                    );
                    setSuccess(`Category ${category.name} berhasil dihapus`);
                    setTimeout(() => setSuccess(""), 3000);
                })
                .catch((err) => {
                    console.log(err);
                    setError("Gagal menghapus category");
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
                            {title}
                        </h2>
                        <button
                            onClick={() => handleOpenModal("Add Category")}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            <PlusCircleIcon className="w-4 h-4 mr-2" />
                            Add Category
                        </button>
                    </div>
                }
            >
                <Modal
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    data={data}
                    handleChange={handleChange}
                    modalType={modalType}
                    filteredData={filteredData}
                    setFilteredData={setFilteredData}
                    setSuccess={setSuccess}
                    setError={setError}
                    setData={setData}
                />

                <Head title="Categories" />

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
                                            placeholder="Search by name or status..."
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
                                    Total:{" "}
                                    <span className="font-semibold">
                                        {filteredData.length}
                                    </span>{" "}
                                    category
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
                                                Name
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
                                                            No category
                                                        </p>
                                                        <p className="text-sm text-gray-400 mt-1">
                                                            {search
                                                                ? "Try different search terms"
                                                                : "Start by adding a Category"}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredData.map((category, i) => (
                                                <tr
                                                    key={category.id}
                                                    className="hover:bg-gray-50 transition-colors duration-150"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {i + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 uppercase">
                                                                    {
                                                                        category.name
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                category.status ===
                                                                    true ||
                                                                category.status ===
                                                                    1
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-red-100 text-red-800"
                                                            }`}
                                                        >
                                                            {category.status ===
                                                                true ||
                                                            category.status ===
                                                                1
                                                                ? "ACTIVE"
                                                                : "INACTIVE"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleOpenModal(
                                                                        "Edit Category",
                                                                        category
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
                                                                        category
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
    handleChange,
    modalType,
    filteredData,
    setFilteredData,
    setSuccess,
    setError,
    setData: setParentData,
}) {
    const close = () => {
        if (closeable) {
            setIsOpen(false);
        }
    };

    const [submitting, setSubmitting] = useState(false);

    function handleSubmit() {
        if (!data.name || data.status === null) {
            setError("Semua field wajib diisi!");
            setTimeout(() => setError(""), 3000);
            return;
        }

        setSubmitting(true);

        // Konversi string "true"/"false" ke boolean true/false
        const statusBoolean = data.status === "true";

        const payload = {
            name: data.name,
            status: statusBoolean,
        };

        const url =
            modalType === "Edit Category"
                ? `/admin/category/${data.id}`
                : "/admin/category";

        if (modalType === "Edit Category") {
            // Untuk update, gunakan PUT
            axios
                .put(url, payload)
                .then((response) => {
                    // Update data di tabel dengan data dari response
                    setFilteredData((prev) =>
                        prev.map((item) =>
                            item.id === data.id ? response.data : item
                        )
                    );
                    setSuccess(`Category ${data.name} berhasil diperbarui`);
                    setTimeout(() => setSuccess(""), 3000);
                    close();
                })
                .catch((err) => {
                    console.log("Error details:", err.response?.data);
                    handleError(err);
                })
                .finally(() => setSubmitting(false));
        } else {
            // Untuk create, langsung POST
            axios
                .post(url, payload)
                .then((response) => {
                    setFilteredData([...filteredData, response.data]);
                    setSuccess(`Category ${data.name} berhasil ditambahkan`);
                    setTimeout(() => setSuccess(""), 3000);
                    close();
                })
                .catch((err) => {
                    console.log("Error details:", err.response?.data);
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
                    modalType === "Edit Category"
                        ? "memperbarui"
                        : "menambahkan"
                } Category`
            );
        }
        setTimeout(() => setError(""), 5000);
    }

    // Fungsi untuk mendapatkan nilai status yang sesuai untuk select
    const getStatusValue = () => {
        if (data.status === null || data.status === "") {
            return "";
        }
        return data.status;
    };

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
                                            {modalType === "Edit Category"
                                                ? "Perbarui informasi Category"
                                                : "Tambahkan Category baru"}
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
                                    <div>
                                        <InputLabel value="Name *" />
                                        <TextInput
                                            id="name"
                                            value={data.name || ""}
                                            onChange={handleChange}
                                            className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            type="text"
                                            placeholder="Enter Category name"
                                        />
                                    </div>

                                    <div>
                                        <InputLabel value="Status *" />
                                        <select
                                            id="status"
                                            value={getStatusValue()}
                                            onChange={handleChange}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-2 px-3"
                                        >
                                            <option value="">
                                                -- Select Status --
                                            </option>
                                            <option value="true">ACTIVE</option>
                                            <option value="false">
                                                INACTIVE
                                            </option>
                                        </select>
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
                                                {modalType === "Edit Category"
                                                    ? "Updating..."
                                                    : "Saving..."}
                                            </>
                                        ) : modalType === "Edit Category" ? (
                                            "Update Category"
                                        ) : (
                                            "Save Category"
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
