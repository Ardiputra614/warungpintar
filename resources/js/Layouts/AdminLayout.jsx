import { Link } from "@inertiajs/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function AdminLayout({ children }) {
    // State to manage sidebar visibility
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    // Function to toggle sidebar visibility
    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* <!-- Sidebar --> */}
            <div
                id="sidebar"
                className={`w-64 bg-gray-800 text-white ${
                    isSidebarVisible ? "block" : "hidden"
                } md:block md:w-64`}
            >
                <div className="p-6">
                    <h2 className="text-2xl font-semibold">Admin Panel</h2>
                </div>
                <nav>
                    <ul>
                        <li>
                            <Link
                                href="/admin/dashboard"
                                className="block px-6 py-2 text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/admin/service"
                                className="block px-6 py-2 text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                                Layanan
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/admin/profil-aplikasi"
                                className="block px-6 py-2 text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                                Profil Aplikasi
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* <!-- Main Content --> */}
            <div className="flex-1 flex flex-col">
                {/* <!-- Navbar --> */}
                <div className="bg-white shadow-md p-4 flex justify-between items-center">
                    <button
                        id="sidebar-toggle"
                        className="text-gray-500 md:hidden focus:outline-none"
                        onClick={toggleSidebar}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            ></path>
                        </svg>
                    </button>
                    <div className="text-lg font-semibold">Admin Dashboard</div>
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-500 hover:text-gray-800">
                            Notifications
                        </button>
                        <button className="text-gray-500 hover:text-gray-800">
                            Profile
                        </button>
                        <Link
                            href={route("logout")}
                            method="post"
                            className="text-gray-500 hover:text-gray-800"
                        >
                            <LogOut className="w-12" />
                        </Link>
                    </div>
                </div>

                {/* <!-- Page Content --> */}
                <div className="flex-1 p-6 bg-[#f8f5f2] overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
