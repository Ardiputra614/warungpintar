import React, { useState } from "react";
import {
    Search,
    ChevronRight,
    Star,
    Zap,
    TrendingUp,
    Clock,
    Filter,
    ShoppingBag,
} from "lucide-react";
import { Link } from "@inertiajs/react";

const Games = ({
    games = [],
    title = "",
    layout = "grid",
    columns = 4,
    className = "",
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("popular");
    const [activeCategory, setActiveCategory] = useState("all");
    const [showFilters, setShowFilters] = useState(false);

    // Get unique categories from games
    const categories = ["all"];
    if (games && games.length > 0) {
        games.forEach((game) => {
            if (game.category && !categories.includes(game.category)) {
                categories.push(game.category);
            }
        });
    }

    // Filter games
    const filteredGames = games.filter((game) => {
        if (!game) return false;

        const matchesSearch =
            searchQuery === "" ||
            (game.name &&
                game.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (game.category &&
                game.category
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()));

        const matchesCategory =
            activeCategory === "all" || game.category === activeCategory;

        return matchesSearch && matchesCategory;
    });

    // Sort games
    const sortedGames = [...filteredGames].sort((a, b) => {
        switch (sortBy) {
            case "alphabetical":
                return (a.name || "").localeCompare(b.name || "");
            case "newest":
                return (
                    new Date(b.created_at || 0) - new Date(a.created_at || 0)
                );
            case "rating":
                return (b.rating || 0) - (a.rating || 0);
            case "popular":
            default:
                // Featured items first, then by name
                if (a.is_featured && !b.is_featured) return -1;
                if (!a.is_featured && b.is_featured) return 1;
                return (a.name || "").localeCompare(b.name || "");
        }
    });

    // Jika tidak ada games
    if (!games || games.length === 0) {
        return (
            <div className="text-center py-12 bg-[#44444E] rounded-3xl border border-gray-700/50">
                <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#D3DAD9] mb-2">
                    Belum ada layanan
                </h3>
                <p className="text-gray-400">
                    Tidak ada layanan untuk kategori ini
                </p>
            </div>
        );
    }

    // Jika setelah filter tidak ada yang cocok
    if (sortedGames.length === 0) {
        return (
            <div className="space-y-6">
                {/* Search and Filter Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Cari layanan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white hover:bg-gray-700/50 transition-colors"
                    >
                        <Filter size={20} />
                        {showFilters ? "Sembunyikan Filter" : "Filter"}
                    </button>
                </div>

                {/* No Results Message */}
                <div className="text-center py-16 bg-[#44444E] rounded-3xl border border-gray-700/50">
                    <Search className="w-20 h-20 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#D3DAD9] mb-2">
                        Tidak ada hasil yang cocok
                    </h3>
                    <p className="text-gray-400 mb-4">
                        Coba gunakan kata kunci yang berbeda atau pilih kategori
                        lain
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setActiveCategory("all");
                        }}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Reset Filter
                    </button>
                </div>
            </div>
        );
    }

    // Render normal dengan data
    return (
        <div className="space-y-6">
            {/* Search and Filter Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Cari layanan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white hover:bg-gray-700/50 transition-colors"
                >
                    <Filter size={20} />
                    {showFilters ? "Sembunyikan Filter" : "Filter"}
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    {/* Category Filters */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">
                            Kategori
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        activeCategory === category
                                            ? "bg-purple-600 text-white"
                                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    }`}
                                >
                                    {category === "all" ? "Semua" : category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-3">
                            Urutkan
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                {
                                    id: "popular",
                                    label: "Populer",
                                    icon: <TrendingUp size={16} />,
                                },
                                {
                                    id: "alphabetical",
                                    label: "A-Z",
                                    icon: (
                                        <span className="font-bold">A→Z</span>
                                    ),
                                },
                                {
                                    id: "newest",
                                    label: "Terbaru",
                                    icon: <Clock size={16} />,
                                },
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setSortBy(option.id)}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        sortBy === option.id
                                            ? "bg-purple-600 text-white"
                                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    }`}
                                >
                                    {option.icon}
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Services Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {sortedGames.map((game) => (
                    <Link
                        href={game.slug ? `/${game.slug}` : "#"}
                        key={game.id}
                        className="block group"
                    >
                        {/* Card Container */}
                        <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-900 to-black shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                            {/* Main Image - Full Bleed */}
                            <div className="relative aspect-[3/4] overflow-hidden">
                                {game.logo ? (
                                    <img
                                        src={`/storage/${game.logo}`}
                                        alt={game.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:blur-[2px]"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                "https://via.placeholder.com/300x400/374151/94a3b8?text=No+Image";
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-gray-400">
                                            {game.name?.charAt(0) || "G"}
                                        </span>
                                    </div>
                                )}

                                {/* Dark Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500"></div>

                                {/* Game Name - Appears on Hover */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="bg-gradient-to-t from-black/90 to-transparent p-3 rounded-t-lg">
                                        <h3 className="text-white font-bold text-sm md:text-base line-clamp-2">
                                            {game.name || "Unnamed Service"}
                                        </h3>

                                        {/* Game Category Badge */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                            <span className="text-xs text-gray-300 capitalize">
                                                {game.category || "Service"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Right Badges */}
                                <div className="absolute top-3 right-3 space-y-2">
                                    {game.is_featured && (
                                        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                            <Zap size={10} />
                                            HOT
                                        </div>
                                    )}
                                    {game.is_new && (
                                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                            NEW
                                        </div>
                                    )}
                                </div>

                                {/* Hover Overlay Effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/0 via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

                                {/* Click Indicator */}
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <ChevronRight
                                            size={16}
                                            className="text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Games;
