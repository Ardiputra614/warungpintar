export default function Banner({ promos, activePromo }) {
    return (
        <>
            {/* PROMO CAROUSEL */}
            <div className="container mx-auto py-6 px-4 sm:px-6">
                <div className="relative">
                    <div
                        className={`bg-gradient-to-r ${promos[activePromo].bgColor} text-white rounded-xl p-9 transition-all duration-500`}
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="md:w-1/2 mb-6 md:mb-0">
                                <h2 className="text-2xl font-bold mb-2">
                                    {promos[activePromo].title}
                                </h2>
                                <p className="text-sm">
                                    {promos[activePromo].description}
                                </p>
                            </div>
                            <div className="md:w-1/2">
                                <img
                                    src={promos[activePromo].image}
                                    alt="Promo Banner"
                                    className="rounded-lg shadow-md w-full object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Slider Indicators */}
                    <div className="absolute bottom-2 right-4 flex space-x-1">
                        {promos.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActivePromo(idx)}
                                className={`w-2.5 h-2.5 rounded-full ${
                                    activePromo === idx
                                        ? "bg-white"
                                        : "bg-white/40"
                                }`}
                            ></button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
