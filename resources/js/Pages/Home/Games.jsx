import React, { useState } from "react";
import {
    Search,
    Gamepad2,
    Store,
    Trophy,
    ChevronRight,
    Star,
} from "lucide-react";
import AppLayout from "@/Layouts/AppLayout";
import axios from "axios";
import { Link } from "@inertiajs/react";

const Game = ({ games }) => {
    const [selectedGame, setSelectedGame] = useState(null);

    // axios.get("/api/getgames").then((res) => setPopulerGames(res.data));

    const [popularGames, setPopulerGames] = useState(games);

    const topupOptions = [
        { amount: "100 Diamonds", price: 25000 },
        { amount: "250 Diamonds", price: 50000 },
        { amount: "500 Diamonds", price: 100000 },
        { amount: "1000 Diamonds", price: 200000 },
    ];

    return (
        <>
            {/* Game Search Section */}
            {/* <div className="bg-gradient-to-r from-amber-700 to-amber-900 p-6"> */}
            {/* <h1 className="text-white text-xl font-bold mb-4">Top Up Game</h1> */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Cari game favoritmu..."
                    className="w-full bg-white rounded-xl py-3 px-4 pl-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                />
                {/* </div> */}
            </div>

            {/* Popular Games */}
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Game Populer
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {popularGames.map((game) => (
                        <Link
                            href={`/gamestopup/${game.slug}`}
                            key={game.id}
                            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div
                                key={game.id}
                                className="relative rounded-lg overflow-hidden shadow-lg group"
                            >
                                <img
                                    src={`/storage/${game.logo}`}
                                    alt={game.name}
                                    className="w-full h-48 object-cover transition-all duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
                                <div className="absolute bottom-0 left-0 p-4 w-full">
                                    <h3 className="text-white font-bold">
                                        {game.name}
                                    </h3>
                                    {/* <span className="inline-block bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold mt-2">
                                        MOONTON
                                    </span> */}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Selected Game Modal */}
            {selectedGame && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                {selectedGame.name}
                            </h2>
                            <div className="space-y-4">
                                {topupOptions.map((option, index) => (
                                    <button
                                        key={index}
                                        className="w-full bg-amber-50 hover:bg-amber-100 p-4 rounded-xl flex justify-between items-center"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Star
                                                className="text-amber-600"
                                                size={20}
                                            />
                                            <span className="font-medium">
                                                {option.amount}
                                            </span>
                                        </div>
                                        <span className="text-amber-800 font-medium">
                                            Rp {option.price.toLocaleString()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-6 flex gap-4">
                                <button
                                    onClick={() => setSelectedGame(null)}
                                    className="w-1/2 py-2 rounded-lg border border-amber-700 text-amber-700"
                                >
                                    Batal
                                </button>
                                <button className="w-1/2 py-2 rounded-lg bg-amber-700 text-white">
                                    Top Up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Game;
