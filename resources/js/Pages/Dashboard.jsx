import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 sm:gap-2 md:gap-4">
                        <div className="bg-white rounded-md w-full text-center">
                            <div className="m-3">Transaksi hari ini</div>
                            <span>100</span>
                        </div>
                        <div className="bg-white rounded-md w-full text-center">
                            <div className="m-3">Saldo Digiflazz</div>
                            <span>100</span>
                        </div>
                        <div className="bg-white rounded-md w-full text-center">
                            <div className="m-3">Pengeluaran Hari ini</div>
                            <span>100</span>
                        </div>
                        <div className="bg-white rounded-md w-full text-center">
                            <div className="m-3">Kunjungan website</div>
                            <span>100</span>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
