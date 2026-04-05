import { useEffect, useState } from "react";
import axios from "axios";
import Authenticated from "@/Layouts/AuthenticatedLayout";

export default function Index({ auth, title }) {
    const [form, setForm] = useState({
        application_name: "",
        application_fee: "",
        saldo: 0,
        terms_condition: "",
        privacy_policy: "",
        logo: null,
        id: "",
    });

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    function fetchProfilAplikasi() {
        axios
            .get("/api/profil-aplikasi")
            .then((res) => {
                if (res.data) setForm(res.data);
            })
            .finally(() => setLoading(false));
    }
    useEffect(() => {
        fetchProfilAplikasi();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm({
            ...form,
            [name]: files ? files[0] : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const data = new FormData();
        Object.keys(form).forEach((key) => {
            if (form[key] !== null) data.append(key, form[key]);
        });

        await axios
            .patch(`/admin/profil-aplikasi/${form.id}`, form)
            .then((res) => {
                if (res.status === 200) {
                    setSaving(false);
                    setSuccess("Berhasil");
                    setTimeout(() => setSuccess(""), 3000);
                    fetchProfilAplikasi();
                }
            });
    };

    if (loading) return <div className="p-6">Memuat data...</div>;

    /* ================= NOTIFICATION COMPONENT ================= */
    const Notification = ({ type, message, onClose }) => (
        <div
            className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
                type === "success"
                    ? "bg-green-50 border-green-500"
                    : "bg-red-50 border-red-500"
            } border-l-4 p-4 rounded-r shadow-lg`}
        >
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    {type === "success" ? (
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
                    ) : (
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
                    )}
                </div>
                <div className="ml-3">
                    <p
                        className={`text-sm ${
                            type === "success"
                                ? "text-green-700"
                                : "text-red-700"
                        }`}
                    >
                        {message}
                    </p>
                </div>
                <div className="ml-auto pl-3">
                    <button
                        onClick={onClose}
                        className={`inline-flex ${
                            type === "success"
                                ? "text-green-500 hover:text-green-700"
                                : "text-red-500 hover:text-red-700"
                        }`}
                    >
                        <span className="sr-only">Close</span>
                        <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <Authenticated user={auth.user}>
            {success && (
                <Notification
                    type="success"
                    message={success}
                    onClose={() => setSuccess("")}
                />
            )}
            {error && (
                <Notification
                    type="error"
                    message={error}
                    onClose={() => setError("")}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {title}
                    </h1>
                    <p className="text-gray-600 mt-1">Kelola Aplikasi</p>
                </div>
            </div>

            <div className="p-6  min-h-screen mx-auto">
                <h1 className="text-2xl font-bold text-[#4b2e1e] mb-6">
                    Pengaturan Aplikasi
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="container md:grid-cols-2 grid gap-3">
                        <div>
                            <label>Nama Aplikasi</label>
                            <input
                                type="text"
                                name="application_name"
                                value={form.application_name}
                                onChange={handleChange}
                                placeholder="Nama Aplikasi"
                                className="w-full border rounded-lg p-2"
                            />
                        </div>

                        <div>
                            <label>Fee Aplikasi</label>
                            <input
                                type="text"
                                name="application_fee"
                                value={form.application_fee}
                                onChange={handleChange}
                                placeholder="Fee Aplikasi"
                                className="w-full border rounded-lg p-2"
                            />
                        </div>

                        <div>
                            <label>Saldo Digiflazz</label>
                            <input
                                type="number"
                                name="saldo"
                                value={form.saldo}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                            />
                        </div>
                        <div>
                            <label>Logo</label>
                            <input
                                type="file"
                                name="logo"
                                onChange={handleChange}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label>Syarat & Ketentuan/Term condition</label>
                            <textarea
                                name="terms_condition"
                                value={form.terms_condition}
                                onChange={handleChange}
                                placeholder="Terms & Conditions"
                                rows={7}
                                className="w-full border rounded-lg p-2"
                            />
                        </div>

                        <div>
                            <label>Kebijakan Privasi/Privacy Policy</label>
                            <textarea
                                name="privacy_policy"
                                value={form.privacy_policy}
                                onChange={handleChange}
                                placeholder="Privacy Policy"
                                rows={7}
                                className="w-full border rounded-lg p-2"
                            />
                        </div>
                    </div>
                    <button
                        disabled={saving}
                        className="bg-[#6b3f26] text-white px-4 py-2 rounded-lg mt-2 items-end"
                    >
                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </form>
            </div>
        </Authenticated>
    );
}
