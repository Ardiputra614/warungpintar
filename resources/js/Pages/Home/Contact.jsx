import AppLayout from "@/Layouts/AppLayout";
import React, { useState } from "react";
import {
    PhoneIcon,
    EnvelopeIcon,
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ShareIcon,
    ClipboardIcon,
} from "@heroicons/react/24/outline";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const [formStatus, setFormStatus] = useState({
        error: false,
        message: "",
    });

    const [copiedText, setCopiedText] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((s) => ({ ...s, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            setFormStatus({
                error: true,
                message: "Semua field wajib diisi.",
            });
            return;
        }

        setFormStatus({
            error: false,
            message:
                "Pesan berhasil dikirim. Tim ARVE SHOP akan menghubungi Anda.",
        });

        setFormData({ name: "", email: "", message: "" });

        setTimeout(() => setFormStatus({ error: false, message: "" }), 4000);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => setCopiedText(""), 2000);
    };

    const phoneNumbers = [
        {
            name: "Customer Service",
            number: "+62 812-3456-7890",
            type: "whatsapp",
            icon: (
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-emerald-400" />
            ),
        },
        {
            name: "Sales",
            number: "+62 813-9876-5432",
            type: "call",
            icon: <PhoneIcon className="w-5 h-5 text-sky-400" />,
        },
    ];

    const emailAddresses = [
        {
            name: "Customer Support",
            email: "support@arveshop.com",
            icon: <EnvelopeIcon className="w-5 h-5 text-rose-400" />,
        },
    ];

    return (
        <div className="min-h-screen text-slate-100 px-4 py-10">
            {/* Header */}
            <div className="max-w-4xl mx-auto text-center mb-12">
                <ShareIcon className="w-10 h-10 mx-auto text-sky-400 mb-4" />
                <h1 className="text-3xl font-bold">Hubungi ARVE SHOP</h1>
                <p className="text-slate-400 mt-2 text-sm">
                    Tim kami siap membantu Anda 24/7
                </p>
            </div>

            {/* Alert */}
            {formStatus.message && (
                <div
                    className={`max-w-4xl mx-auto mb-6 p-4 rounded-lg flex items-center ${
                        formStatus.error
                            ? "bg-rose-900/40 text-rose-300"
                            : "bg-emerald-900/40 text-emerald-300"
                    }`}
                >
                    {formStatus.error ? (
                        <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                    ) : (
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                    )}
                    {formStatus.message}
                </div>
            )}

            {/* Copy Notification */}
            {copiedText && (
                <div className="fixed top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg flex items-center z-50">
                    <ClipboardIcon className="w-4 h-4 mr-2" />
                    Disalin ke clipboard
                </div>
            )}

            <div className="max-w-4xl mx-auto grid gap-10">
                {/* Phone */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <PhoneIcon className="w-5 h-5 mr-2" />
                        Kontak Telepon
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {phoneNumbers.map((p, i) => (
                            <div
                                key={i}
                                className="bg-slate-950 p-5 rounded-xl border border-slate-800"
                            >
                                <div className="flex items-center mb-2">
                                    {p.icon}
                                    <span className="ml-2 font-medium">
                                        {p.name}
                                    </span>
                                </div>
                                <p className="font-bold">{p.number}</p>
                                <div className="flex gap-2 mt-4">
                                    <a
                                        href={
                                            p.type === "whatsapp"
                                                ? `https://wa.me/${p.number.replace(
                                                      /\D/g,
                                                      ""
                                                  )}`
                                                : `tel:${p.number}`
                                        }
                                        className="flex-1 text-center bg-sky-600 hover:bg-sky-500 text-white py-2 rounded-lg text-sm"
                                    >
                                        Hubungi
                                    </a>
                                    <button
                                        onClick={() =>
                                            copyToClipboard(p.number)
                                        }
                                        className="px-3 bg-slate-800 rounded-lg"
                                    >
                                        <ClipboardIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Email */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <EnvelopeIcon className="w-5 h-5 mr-2" />
                        Email
                    </h2>
                    {emailAddresses.map((e, i) => (
                        <div
                            key={i}
                            className="bg-slate-950 p-5 rounded-xl border border-slate-800"
                        >
                            <div className="flex items-center mb-2">
                                {e.icon}
                                <span className="ml-2 font-medium">
                                    {e.name}
                                </span>
                            </div>
                            <p className="font-bold break-all">{e.email}</p>
                            <button
                                onClick={() => copyToClipboard(e.email)}
                                className="mt-4 bg-slate-800 px-4 py-2 rounded-lg flex items-center text-sm"
                            >
                                <ClipboardIcon className="w-4 h-4 mr-2" />
                                Salin Email
                            </button>
                        </div>
                    ))}
                </section>

                {/* Form */}
                <section className="bg-slate-950 p-6 rounded-xl border border-slate-800">
                    <h2 className="text-xl font-semibold mb-4">Kirim Pesan</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            name="name"
                            placeholder="Nama"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <input
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <textarea
                            name="message"
                            placeholder="Pesan"
                            rows="4"
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <button
                            type="submit"
                            className="w-full bg-sky-600 hover:bg-sky-500 text-white py-3 rounded-lg flex items-center justify-center text-sm font-medium"
                        >
                            <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                            Kirim Pesan
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

Contact.layout = (page) => <AppLayout children={page} />;
export default Contact;
