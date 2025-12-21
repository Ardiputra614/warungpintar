import { Link } from "@inertiajs/react";
import { Bell, User } from "lucide-react";

const Navbar = ({ user }) => {
    return (
        <>
            {/* Top Navigation */}
            <nav className="bg-[#1a191d] border-b border-amber-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link
                                    href="/"
                                    className="text-white text-xl font-bold"
                                >
                                    Warung Pintar
                                </Link>
                            </div>
                        </div>
                        {/* <div className="flex items-center">
                            <div className="ml-3 relative">
                                <Link
                                    href={route("profile.edit")}
                                    className="text-white"
                                >
                                    {user?.name}
                                    <div className="flex items-center gap-4">
                                        <Bell
                                            className="text-white"
                                            size={20}
                                        />
                                        <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
                                            <User
                                                className="text-amber-800"
                                                size={20}
                                            />
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div> */}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
