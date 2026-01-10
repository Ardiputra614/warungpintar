import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "@/Layouts/AdminLayout";

export default function Index() {
    const [form, setForm] = useState({
        application_name: "",
        application_fee: "",
        saldo: 0,
        terms_condition: "",
        privacy_policy: "",
        logo: null,
    });

    console.log(form);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axios
            .get("/api/profil-aplikasi")
            .then((res) => {
                if (res.data) setForm(res.data);
            })
            .finally(() => setLoading(false));
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

        await axios.post("/api/application/update", data);
        setSaving(false);
        alert("Pengaturan aplikasi berhasil diperbarui");
    };

    if (loading) return <div className="p-6">Memuat data...</div>;

    return (
        <div className="p-6  min-h-screen">
            <h1 className="text-2xl font-bold text-[#4b2e1e] mb-6">
                Pengaturan Aplikasi
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                <input
                    type="text"
                    name="application_name"
                    value={form.application_name}
                    onChange={handleChange}
                    placeholder="Nama Aplikasi"
                    className="w-full border rounded-lg p-2"
                />

                <input
                    type="text"
                    name="application_fee"
                    value={form.application_fee}
                    onChange={handleChange}
                    placeholder="Fee Aplikasi"
                    className="w-full border rounded-lg p-2"
                />

                <input
                    type="number"
                    name="saldo"
                    value={form.saldo}
                    onChange={handleChange}
                    className="w-full border rounded-lg p-2"
                />

                <textarea
                    name="terms_condition"
                    value={form.terms_condition}
                    onChange={handleChange}
                    placeholder="Terms & Conditions"
                    rows={4}
                    className="w-full border rounded-lg p-2"
                />

                <textarea
                    name="privacy_policy"
                    value={form.privacy_policy}
                    onChange={handleChange}
                    placeholder="Privacy Policy"
                    rows={4}
                    className="w-full border rounded-lg p-2"
                />

                <input
                    type="file"
                    name="logo"
                    onChange={handleChange}
                    className="w-full"
                />

                <button
                    disabled={saving}
                    className="bg-[#6b3f26] text-white px-4 py-2 rounded-lg"
                >
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </form>
        </div>
    );
}

Index.layout = (page) => <AdminLayout children={page} />;
