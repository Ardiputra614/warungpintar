import Footer from "@/Components/Footer";
import Navbar from "@/Components/Home/Navbar";
import { Link } from "@inertiajs/react";
import {
    Bell,
    Gamepad2,
    History,
    Home,
    Receipt,
    TrendingUp,
    User,
} from "lucide-react";
import { useState } from "react";

export default function AppLayout({ user, header, aplikasi, children }) {
    const [balance, setBalance] = useState(1500000);
    // console.log(children);
    return (
        <div className="min-h-screen bg-[#37353E] text-white">
            <Navbar />

            {/* <header className="bg-brown-600 bg-gradient-to-r from-amber-700 to-amber-900 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <h1 className="text-xl font-bold">PPOB App</h1>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="text-white" size={20} />
            <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
              <User className="text-amber-800" size={20} />
            </div>
          </div>
        </div>
      </header> */}

            {/* Balance Card */}
            {/* <div className="container mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-xl p-6 text-white mb-6">
          <p className="text-sm opacity-80">Saldo Anda</p>
          <h2 className="text-2xl font-bold mb-4">Rp {balance.toLocaleString()}</h2>
          <div className="flex gap-4">
            <button className="bg-white text-amber-900 px-4 py-2 rounded-lg flex items-center gap-2">
              <TrendingUp size={16} />
              Top Up
            </button>
            <button className="border border-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Receipt size={16} />
              Transfer
            </button>
            </div>
          </div>
        </div>            */}

            {/* Main Content */}
            {/* <main className=""></main> */}
            <main className="pb-20 container mx-auto px-4 py-6">
                {children}
            </main>

            {/* Bottom Navigation */}
            {/* <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3">
                <div className="max-w-7xl mx-auto px-4 flex justify-around">
                    <Link
                        href={route("home")}
                        className="flex flex-col items-center text-amber-800"
                    >
                        <Home size={20} />
                        <span className="text-xs">Home</span>
                    </Link>
                    <Link
                        href={route("games")}
                        className="flex flex-col items-center text-gray-400"
                    >
                        <Gamepad2 size={20} />
                        <span className="text-xs">Games</span>
                    </Link>
                    <Link
                        href={route("history")}
                        className="flex flex-col items-center text-gray-400"
                    >
                        <History size={20} />
                        <span className="text-xs">History</span>
                    </Link>
                </div>
            </nav> */}

            <Footer aplikasi={aplikasi} />
        </div>
    );
}
