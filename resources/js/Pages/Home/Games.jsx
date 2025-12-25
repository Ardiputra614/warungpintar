import React, { useState } from "react";
import {
    Search,
    Gamepad2,
    ChevronRight,
    Star,
    Zap,
    Sparkles,
    Filter,
    X,
    TrendingUp,
    Clock,
    Hash,
} from "lucide-react";
import { Link } from "@inertiajs/react";

const Game = ({ games }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("popular");
    const [activeCategory, setActiveCategory] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    // Get unique categories
    const categories = [
        "all",
        ...new Set(games.map((game) => game.category).filter(Boolean)),
    ];

    // Filter games
    const filteredGames = games.filter((game) => {
        const matchesSearch =
            game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
                return a.name.localeCompare(b.name);
            case "newest":
                return (
                    new Date(b.created_at || 0) - new Date(a.created_at || 0)
                );
            case "rating":
                return (b.rating || 0) - (a.rating || 0);
            case "popular":
            default:
                return (b.popularity || 0) - (a.popularity || 0);
        }
    });
    // console.log("kategori", games);

    return (
        <div className="space-y-6">
            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    {/* Category Filters */}
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
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
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {category === "all" ? "Semua" : category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
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
                                {
                                    id: "rating",
                                    label: "Rating",
                                    icon: <Star size={16} />,
                                },
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setSortBy(option.id)}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        sortBy === option.id
                                            ? "bg-purple-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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

            {/* Game Grid - Full Image Portrait with Hover Text */}
            {sortedGames.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                    {sortedGames.map((game) => (
                        <Link
                            href={
                                game.category === "pascabayar"
                                    ? `/pascabayar/${game.slug}`
                                    : `/${game.slug}`
                            }
                            key={game.id}
                            className="block group"
                        >
                            {/* Card Container */}
                            <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-gray-900 to-black shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                                {/* Main Image - Full Bleed */}
                                <div className="relative aspect-[3/4] overflow-hidden">
                                    <img
                                        src={`/storage/${game.logo}`}
                                        alt={game.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:blur-[2px]"
                                    />

                                    {/* Dark Overlay on Hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500"></div>

                                    {/* Game Name - Appears on Hover */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="bg-gradient-to-t from-black/90 to-transparent p-3 rounded-t-lg">
                                            <h3 className="text-white font-bold text-sm md:text-base line-clamp-2">
                                                {game.name}
                                            </h3>

                                            {/* Game Category Badge */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                                <span className="text-xs text-gray-300 capitalize">
                                                    {game.category || "Game"}
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

                                    {/* Rating Badge */}
                                    {/* {game.rating && (
                                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                            <Star
                                                size={10}
                                                className="text-yellow-400 fill-yellow-400"
                                            />
                                            {game.rating}
                                        </div>
                                    )} */}

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
            ) : (
                <div className="text-center py-16 rounded-lg border border-dashed border-white">
                    {/* <Gamepad2 className="w-20 h-20 text-gray-300 mx-auto mb-4" /> */}
                    <h3 className="text-xl font-bold text-white mb-2">
                        Data tidak ditemukan
                    </h3>
                </div>
            )}
        </div>
    );
};

export default Game;
