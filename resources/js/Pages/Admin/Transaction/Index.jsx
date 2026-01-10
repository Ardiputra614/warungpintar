import FormatRupiah from "@/Components/FormatRupiah";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import {
    PenIcon,
    PlusCircleIcon,
    Trash2Icon,
    SearchIcon,
    FilterIcon,
    DownloadIcon,
    CalendarIcon,
    TrendingUpIcon,
    DollarSignIcon,
    CreditCardIcon,
    UsersIcon,
    BarChart3Icon,
    PieChartIcon,
    XIcon,
} from "lucide-react";
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import FormatRupiahInput from "@/Components/FormatRupiahInput";
import axios from "axios";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const Index = ({ auth, transaction, title, stats }) => {
    const [filteredData, setFilteredData] = useState(transaction);
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [chartData, setChartData] = useState({
        daily: [],
        weekly: [],
        monthly: [],
    });

    const [data, setData] = useState({
        id: "",
        order_id: "",
        transaction_id: "",
        gross_amount: "",
        payment_status: "",
        payment_method_name: "",
        wa_pembeli: "",
        product_name: "",
        customer_no: "",
        product_type: "",
        selling_price: "",
        purchase_price: "",
        digiflazz_status: "",
        status_message: "",
        serial_number: "",
        voucher_code: "",
    });

    let [modalType, setModalType] = useState("");
    let [isOpen, setIsOpen] = useState(false);

    // Fetch chart data
    useEffect(() => {
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        try {
            const response = await axios.get("/admin/transactions/chart-data");
            setChartData(response.data);
        } catch (err) {
            console.error("Error fetching chart data:", err);
        }
    };

    // Search and filter functionality
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearch(value);

        let filtered = transaction;

        // Apply text search
        if (value) {
            filtered = filtered.filter(
                (item) =>
                    item.order_id?.toLowerCase().includes(value) ||
                    item.customer_no?.toLowerCase().includes(value) ||
                    item.product_name?.toLowerCase().includes(value) ||
                    item.payment_method_name?.toLowerCase().includes(value) ||
                    item.wa_pembeli?.includes(value)
            );
        }

        // Apply status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(
                (item) => item.payment_status === statusFilter
            );
        }

        // Apply date filter (simplified - implement actual date filtering)
        if (dateFilter !== "all") {
            const now = new Date();
            filtered = filtered.filter((item) => {
                const itemDate = new Date(item.created_at);
                switch (dateFilter) {
                    case "today":
                        return itemDate.toDateString() === now.toDateString();
                    case "week":
                        const weekAgo = new Date(
                            now.setDate(now.getDate() - 7)
                        );
                        return itemDate >= weekAgo;
                    case "month":
                        const monthAgo = new Date(
                            now.setMonth(now.getMonth() - 1)
                        );
                        return itemDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }

        setFilteredData(filtered);
    };

    useEffect(() => {
        handleSearch({ target: { value: search } });
    }, [statusFilter, dateFilter]);

    function handleChange(e) {
        const id = e.target.id;
        const value = e.target.value;

        setData({
            ...data,
            [id]: value,
        });
    }

    function handleOpenModal(e, transactionData) {
        setModalType(e);
        setError("");
        setSuccess("");

        if (e === "Edit Transaction" && transactionData) {
            setIsOpen(!isOpen);
            setData({
                id: transactionData.id,
                order_id: transactionData.order_id,
                transaction_id: transactionData.transaction_id,
                gross_amount: transactionData.gross_amount,
                payment_status: transactionData.payment_status,
                payment_method_name: transactionData.payment_method_name,
                wa_pembeli: transactionData.wa_pembeli,
                product_name: transactionData.product_name,
                customer_no: transactionData.customer_no,
                product_type: transactionData.product_type,
                selling_price: transactionData.selling_price,
                purchase_price: transactionData.purchase_price,
                digiflazz_status: transactionData.digiflazz_status,
                status_message: transactionData.status_message,
                serial_number: transactionData.serial_number,
                voucher_code: transactionData.voucher_code,
            });
        } else {
            setIsOpen(!isOpen);
            setData({
                id: "",
                order_id: "",
                transaction_id: "",
                gross_amount: "",
                payment_status: "",
                payment_method_name: "",
                wa_pembeli: "",
                product_name: "",
                customer_no: "",
                product_type: "",
                selling_price: "",
                purchase_price: "",
                digiflazz_status: "",
                status_message: "",
                serial_number: "",
                voucher_code: "",
            });
        }
    }

    function handleDelete(transaction) {
        if (window.confirm(`Delete transaction ${transaction.order_id}?`)) {
            setLoading(true);
            axios
                .delete(`/admin/transactions/${transaction.id}`)
                .then(() => {
                    setFilteredData((prev) =>
                        prev.filter((item) => item.id !== transaction.id)
                    );
                    setSuccess(`Transaction ${transaction.order_id} deleted`);
                    setTimeout(() => setSuccess(""), 3000);
                })
                .catch((err) => {
                    console.log(err);
                    setError("Failed to delete transaction");
                    setTimeout(() => setError(""), 3000);
                })
                .finally(() => setLoading(false));
        }
    }

    const exportToCSV = () => {
        const headers = [
            "Order ID",
            "Transaction ID",
            "Product",
            "Customer Number",
            "Gross Amount",
            "Selling Price",
            "Purchase Price",
            "Payment Status",
            "Payment Method",
            "WA Pembeli",
            "Created At",
        ];

        const csvData = filteredData.map((item) => [
            item.order_id,
            item.transaction_id,
            item.product_name,
            item.customer_no,
            item.gross_amount,
            item.selling_price,
            item.purchase_price,
            item.payment_status,
            item.payment_method_name,
            item.wa_pembeli,
            new Date(item.created_at).toLocaleDateString(),
        ]);

        const csvContent = [
            headers.join(","),
            ...csvData.map((row) => row.join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transactions_${
            new Date().toISOString().split("T")[0]
        }.csv`;
        a.click();
    };

    // Stats cards data
    const statsData = stats || {
        totalRevenue: filteredData.reduce(
            (sum, item) => sum + (parseInt(item.gross_amount) || 0),
            0
        ),
        totalTransactions: filteredData.length,
        successRate:
            (filteredData.filter((item) => item.payment_status === "success")
                .length /
                filteredData.length) *
                100 || 0,
        averageAmount:
            filteredData.reduce(
                (sum, item) => sum + (parseInt(item.gross_amount) || 0),
                0
            ) / filteredData.length || 0,
    };

    // Chart colors
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

    return (
        <>
            <Authenticated
                user={auth.user}
                header={
                    <div className="justify-between flex items-center">
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {title}
                        </h2>
                        <div className="flex gap-3">
                            <button
                                onClick={exportToCSV}
                                className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 transition ease-in-out duration-150"
                            >
                                <DownloadIcon className="w-4 h-4 mr-2" />
                                Export CSV
                            </button>
                            <button
                                onClick={() =>
                                    handleOpenModal("Add Transaction")
                                }
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 transition ease-in-out duration-150"
                            >
                                <PlusCircleIcon className="w-4 h-4 mr-2" />
                                Add Transaction
                            </button>
                        </div>
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
                />

                <Head title={title} />

                <div className="py-8">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        {/* Notifications */}
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

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                                        <DollarSignIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Total Revenue
                                        </p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            <FormatRupiah
                                                value={statsData.totalRevenue}
                                            />
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
                                        <CreditCardIcon className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Total Transactions
                                        </p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {statsData.totalTransactions}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
                                        <TrendingUpIcon className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Success Rate
                                        </p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {statsData.successRate.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-lg">
                                        <UsersIcon className="h-6 w-6 text-yellow-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">
                                            Avg. Amount
                                        </p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            <FormatRupiah
                                                value={statsData.averageAmount}
                                            />
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Daily Transactions Chart */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        <BarChart3Icon className="inline-block w-5 h-5 mr-2" />
                                        Daily Transactions
                                    </h3>
                                </div>
                                <div className="h-64">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart data={chartData.daily}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar
                                                dataKey="count"
                                                name="Transactions"
                                                fill="#3B82F6"
                                            />
                                            <Bar
                                                dataKey="revenue"
                                                name="Revenue"
                                                fill="#10B981"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Payment Status Distribution */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        <PieChartIcon className="inline-block w-5 h-5 mr-2" />
                                        Payment Status
                                    </h3>
                                </div>
                                <div className="h-64">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    {
                                                        name: "Success",
                                                        value: filteredData.filter(
                                                            (t) =>
                                                                t.payment_status ===
                                                                "success"
                                                        ).length,
                                                    },
                                                    {
                                                        name: "Pending",
                                                        value: filteredData.filter(
                                                            (t) =>
                                                                t.payment_status ===
                                                                "pending"
                                                        ).length,
                                                    },
                                                    {
                                                        name: "Failed",
                                                        value: filteredData.filter(
                                                            (t) =>
                                                                t.payment_status ===
                                                                "failed"
                                                        ).length,
                                                    },
                                                    {
                                                        name: "Expired",
                                                        value: filteredData.filter(
                                                            (t) =>
                                                                t.payment_status ===
                                                                "expired"
                                                        ).length,
                                                    },
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(entry) =>
                                                    `${entry.name}: ${entry.value}`
                                                }
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {COLORS.map((color, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={color}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Filters and Search */}
                        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <SearchIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={handleSearch}
                                            placeholder="Search by Order ID, Customer, Product..."
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <select
                                        value={dateFilter}
                                        onChange={(e) =>
                                            setDateFilter(e.target.value)
                                        }
                                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">
                                            This Month
                                        </option>
                                    </select>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                        }
                                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="success">Success</option>
                                        <option value="pending">Pending</option>
                                        <option value="failed">Failed</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                        <FilterIcon className="w-4 h-4 mr-2" />
                                        More Filters
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Transaction History
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Showing {filteredData.length} of{" "}
                                            {transaction.length} transactions
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Last updated:{" "}
                                        {new Date().toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Order Details
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Product
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Amount
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
                                                Contact
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
                                                            No transactions
                                                            found
                                                        </p>
                                                        <p className="text-sm text-gray-400 mt-1">
                                                            {search ||
                                                            statusFilter !==
                                                                "all" ||
                                                            dateFilter !== "all"
                                                                ? "Try different filters or search terms"
                                                                : "No transactions available"}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredData.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-gray-50 transition-colors duration-150"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.order_id}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {
                                                                item.transaction_id
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            {new Date(
                                                                item.created_at
                                                            ).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900">
                                                            {item.product_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {item.customer_no}
                                                        </div>
                                                        <div className="text-xs">
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                                {
                                                                    item.product_type
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            <FormatRupiah
                                                                value={
                                                                    item.gross_amount
                                                                }
                                                            />
                                                        </div>
                                                        {item.selling_price && (
                                                            <div className="text-xs text-gray-500">
                                                                Profit:{" "}
                                                                <FormatRupiah
                                                                    value={
                                                                        item.selling_price -
                                                                        item.purchase_price
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span
                                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                item.payment_status ===
                                                                "success"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : item.payment_status ===
                                                                      "pending"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : item.payment_status ===
                                                                      "failed"
                                                                    ? "bg-red-100 text-red-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }`}
                                                        >
                                                            {item.payment_status?.toUpperCase()}
                                                        </span>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {
                                                                item.payment_method_name
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {item.wa_pembeli}
                                                        </div>
                                                        {item.customer_name && (
                                                            <div className="text-xs text-gray-500">
                                                                {
                                                                    item.customer_name
                                                                }
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleOpenModal(
                                                                        "Edit Transaction",
                                                                        item
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
                                                                        item
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

                            {/* Pagination */}
                            {filteredData.length > 0 && (
                                <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            Page{" "}
                                            <span className="font-medium">
                                                1
                                            </span>{" "}
                                            of{" "}
                                            <span className="font-medium">
                                                1
                                            </span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                                Previous
                                            </button>
                                            <button className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
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
            !data.order_id ||
            !data.gross_amount ||
            !data.transaction_id ||
            !data.payment_status
        ) {
            setError(
                "Required fields: Order ID, Gross Amount, Transaction ID, Payment Status"
            );
            setTimeout(() => setError(""), 3000);
            return;
        }

        setSubmitting(true);

        const url =
            modalType === "Edit Transaction"
                ? `/admin/transactions/${data.id}`
                : "/admin/transactions";

        const method = modalType === "Edit Transaction" ? "put" : "post";

        axios[method](url, data)
            .then((response) => {
                if (modalType === "Edit Transaction") {
                    setFilteredData((prev) =>
                        prev.map((item) =>
                            item.id === data.id ? response.data : item
                        )
                    );
                    setSuccess(
                        `Transaction ${data.order_id} updated successfully`
                    );
                } else {
                    setFilteredData([...filteredData, response.data]);
                    setSuccess(
                        `Transaction ${data.order_id} added successfully`
                    );
                }
                setTimeout(() => setSuccess(""), 3000);
                close();
            })
            .catch((err) => {
                console.log("Error details:", err);
                handleError(err);
            })
            .finally(() => setSubmitting(false));
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
                `Failed to ${
                    modalType === "Edit Transaction" ? "update" : "add"
                } transaction`
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
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
                            {/* Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Dialog.Title className="text-lg font-medium text-gray-900">
                                            {modalType}
                                        </Dialog.Title>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {modalType === "Edit Transaction"
                                                ? "Update transaction details"
                                                : "Add new transaction"}
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="Order ID *" />
                                            <TextInput
                                                id="order_id"
                                                value={data.order_id || ""}
                                                onChange={handleChange}
                                                className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                type="text"
                                                placeholder="ORD-XXXX-XXXX"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Transaction ID *" />
                                            <TextInput
                                                id="transaction_id"
                                                value={
                                                    data.transaction_id || ""
                                                }
                                                onChange={handleChange}
                                                className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                type="text"
                                                placeholder="TRX-XXXX-XXXX"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="Gross Amount *" />
                                            <FormatRupiahInput
                                                id="gross_amount"
                                                value={data.gross_amount || ""}
                                                onChange={handleChange}
                                                className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Payment Status *" />
                                            <select
                                                id="payment_status"
                                                value={
                                                    data.payment_status || ""
                                                }
                                                onChange={handleChange}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-2 px-3"
                                            >
                                                <option value="">
                                                    -- Select Status --
                                                </option>
                                                <option value="success">
                                                    Success
                                                </option>
                                                <option value="pending">
                                                    Pending
                                                </option>
                                                <option value="failed">
                                                    Failed
                                                </option>
                                                <option value="expired">
                                                    Expired
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="Product Name" />
                                            <TextInput
                                                id="product_name"
                                                value={data.product_name || ""}
                                                onChange={handleChange}
                                                className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                type="text"
                                                placeholder="Product name"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Product Type" />
                                            <select
                                                id="product_type"
                                                value={data.product_type || ""}
                                                onChange={handleChange}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 py-2 px-3"
                                            >
                                                <option value="">
                                                    -- Select Type --
                                                </option>
                                                <option value="pulsa">
                                                    Pulsa
                                                </option>
                                                <option value="pln">PLN</option>
                                                <option value="game">
                                                    Game
                                                </option>
                                                <option value="pdam">
                                                    PDAM
                                                </option>
                                                <option value="voucher">
                                                    Voucher
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="Customer Number" />
                                            <TextInput
                                                id="customer_no"
                                                value={data.customer_no || ""}
                                                onChange={handleChange}
                                                className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                type="text"
                                                placeholder="Customer phone number"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="WA Pembeli" />
                                            <TextInput
                                                id="wa_pembeli"
                                                value={data.wa_pembeli || ""}
                                                onChange={handleChange}
                                                className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                type="text"
                                                placeholder="WhatsApp number"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="Selling Price" />
                                            <FormatRupiahInput
                                                id="selling_price"
                                                value={data.selling_price || ""}
                                                onChange={handleChange}
                                                className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Purchase Price" />
                                            <FormatRupiahInput
                                                id="purchase_price"
                                                value={
                                                    data.purchase_price || ""
                                                }
                                                onChange={handleChange}
                                                className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <InputLabel value="Status Message" />
                                        <TextInput
                                            id="status_message"
                                            value={data.status_message || ""}
                                            onChange={handleChange}
                                            className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            type="text"
                                            placeholder="Status message"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="Voucher Code" />
                                            <TextInput
                                                id="voucher_code"
                                                value={data.voucher_code || ""}
                                                onChange={handleChange}
                                                className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                type="text"
                                                placeholder="Voucher code if any"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Serial Number" />
                                            <TextInput
                                                id="serial_number"
                                                value={data.serial_number || ""}
                                                onChange={handleChange}
                                                className="w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                type="text"
                                                placeholder="Serial number"
                                            />
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
                                                "Edit Transaction"
                                                    ? "Updating..."
                                                    : "Saving..."}
                                            </>
                                        ) : modalType === "Edit Transaction" ? (
                                            "Update Transaction"
                                        ) : (
                                            "Save Transaction"
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
