import React from "react";
import {
    Facebook,
    Instagram,
    Twitter,
    Mail,
    PhoneCall,
    MapPin,
} from "lucide-react";

const Footer = ({ aplikasi }) => {
    return (
        <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-600">
                {/* Brand & Contact */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3">
                        Warung Pintar
                    </h2>
                    <p className="mb-3">Top up mudah, cepat dan terpercaya.</p>
                    <div className="flex items-center space-x-2">
                        <PhoneCall size={16} />
                        <span>+62 812-3456-7890</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                        <Mail size={16} />
                        <span>warungpintar@gmail.com</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                        <MapPin size={16} />
                        <span>Purbalingga, Indonesia</span>
                    </div>
                </div>

                {/* Navigation */}
                <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-3">
                        Navigasi
                    </h3>
                    <ul className="space-y-2">
                        <li>
                            <a href="#" className="hover:text-blue-600">
                                Home
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-blue-600">
                                Cek Transaksi
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-blue-600">
                                Kalkulator
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-blue-600">
                                Syarat & Ketentuan
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Social Media */}
                <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-3">
                        Ikuti Kami
                    </h3>
                    <div className="flex space-x-4">
                        <a href="#" className="hover:text-blue-600">
                            <Facebook size={20} />
                        </a>
                        <a href="#" className="hover:text-pink-500">
                            <Instagram size={20} />
                        </a>
                        <a href="#" className="hover:text-sky-500">
                            <Twitter size={20} />
                        </a>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-gray-400 py-4 border-t">
                © {new Date().getFullYear()} OuraStore. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
