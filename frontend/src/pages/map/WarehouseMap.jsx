
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import {
    FaMapMarkedAlt,
    FaWarehouse,
    FaSearch,
    FaLayerGroup,
    FaChartPie,
    FaFilter,
    FaTimes,
    FaCube,
} from "react-icons/fa";
import BinDetailsModal from "../../components/warehouse/BinDetailsModal";
import toast from "react-hot-toast";

function WarehouseMap() {
    const [bins, setBins] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState("all");
    const [selectedLevel, setSelectedLevel] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBin, setSelectedBin] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        fetchData();
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [binsRes, inventoryRes] = await Promise.all([
                api.get("/bins"),
                api.get("/inventory"),
            ]);
            setBins(binsRes.data.data || []);
            setInventory(inventoryRes.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch warehouse data");
        } finally {
            setLoading(false);
        }
    };

    // Calculate bin utilization
    const getBinUtilization = (bin) => {
        const binInventory = inventory.filter(
            (item) => item.bin?._id === bin._id || item.bin === bin._id
        );
        const totalQty = binInventory.reduce((sum, item) => sum + item.qty, 0);
        const utilization = (totalQty / (bin.volumeCapacity || 1)) * 100;
        return Math.min(utilization, 100);
    };

    // Get bin color based on utilization
    const getBinColor = (utilization, status) => {
        if (status === "FULL") return "from-red-600 to-red-500";
        if (status === "MAINTENANCE") return "from-gray-500 to-gray-400";
        if (utilization >= 90) return "from-red-500 to-red-400";
        if (utilization >= 70) return "from-orange-500 to-orange-400";
        if (utilization >= 40) return "from-yellow-500 to-yellow-400";
        return "from-green-500 to-green-400";
    };

    // Get zone from bin code
    const getZoneFromCode = (code) => {
        if (!code) return "Other";
        const prefix = code.split("-")[0];
        const zones = {
            A: "A-Zone (Fast Moving)",
            B: "B-Zone (Medium Moving)",
            C: "C-Zone (Slow Moving)",
            COLD: "Cold Storage",
            HV: "High Value Zone",
            DANGER: "Hazardous Zone",
        };
        return zones[prefix] || "Other Zone";
    };

    // Get unique zones
    const zones = [...new Set(bins.map((bin) => getZoneFromCode(bin.code)))];

    // Get unique levels (Z coordinates)
    const levels = [
        ...new Set(
            bins
                .map((b) => b.z)
                .filter((z) => z !== null && z !== undefined)
                .sort((a, b) => a - b)
        ),
    ];

    // Filter bins
    const filteredBins = bins.filter((bin) => {
        const matchesZone = selectedZone === "all" || getZoneFromCode(bin.code) === selectedZone;
        const matchesSearch = bin.code?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = selectedLevel === "all" || Number(bin.z) === Number(selectedLevel);
        return matchesZone && matchesSearch && matchesLevel;
    });

    // REAL WMS 3D GROUPING: X (Aisle) -> Y (Bay/Row) -> Z (Level)
    const groupWarehouse3D = (binsList) => {
        const warehouse = {};

        binsList.forEach((bin) => {
            const x = Number(bin.x || 1);  // Aisle
            const y = Number(bin.y || 1);  // Bay/Row
            const z = Number(bin.z || 1);  // Level

            if (!warehouse[x]) warehouse[x] = {};
            if (!warehouse[x][y]) warehouse[x][y] = {};
            if (!warehouse[x][y][z]) warehouse[x][y][z] = [];

            warehouse[x][y][z].push(bin);
        });

        return warehouse;
    };

    const warehouseMap = groupWarehouse3D(filteredBins);

    // Statistics
    const stats = {
        total: bins.length,
        available: bins.filter((b) => {
            const util = getBinUtilization(b);
            return util < 40 && b.status !== "FULL";
        }).length,
        full: bins.filter((b) => {
            const util = getBinUtilization(b);
            return util >= 90 || b.status === "FULL";
        }).length,
        maintenance: bins.filter((b) => b.status === "MAINTENANCE").length,
        utilization: (bins.reduce((sum, b) => sum + getBinUtilization(b), 0) / bins.length) || 0,
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-4 sm:p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                            Warehouse Map
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            3D Rack Visualization | X=Aisle | Y=Bay | Z=Level
                        </p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition"
                    >
                        <FaMapMarkedAlt />
                        <span>Refresh Map</span>
                    </button>
                </div>

                {/* Statistics Panel */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Bins</p>
                                <h2 className="text-2xl font-bold">{stats.total}</h2>
                            </div>
                            <FaWarehouse className="text-amber-500 text-2xl" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Available</p>
                                <h2 className="text-2xl font-bold text-green-600">{stats.available}</h2>
                            </div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Full</p>
                                <h2 className="text-2xl font-bold text-red-600">{stats.full}</h2>
                            </div>
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Maintenance</p>
                                <h2 className="text-2xl font-bold text-gray-600">{stats.maintenance}</h2>
                            </div>
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Utilization</p>
                                <h2 className="text-2xl font-bold text-blue-600">
                                    {stats.utilization.toFixed(1)}%
                                </h2>
                            </div>
                            <FaChartPie className="text-blue-500 text-2xl" />
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search bin by code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 border rounded-xl py-3 focus:ring-2 focus:ring-amber-500 dark:bg-slate-800"
                        />
                    </div>

                    <div className="flex gap-3">
                        <select
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                            className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 dark:bg-slate-800"
                        >
                            <option value="all">All Zones</option>
                            {zones.map((zone) => (
                                <option key={zone} value={zone}>{zone}</option>
                            ))}
                        </select>

                        <select
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 dark:bg-slate-800"
                        >
                            <option value="all">All Levels</option>
                            {levels.map((level) => (
                                <option key={level} value={level}>Level {level}</option>
                            ))}
                        </select>
                    </div>

                    {isMobile && (
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="flex items-center justify-center gap-2 bg-gray-100 border rounded-xl px-4 py-3"
                        >
                            <FaFilter /> Filters
                        </button>
                    )}
                </div>

                {/* Legend */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4 mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <FaLayerGroup /> Legend
                    </h3>
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-sm">Available (&lt;40%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                            <span className="text-sm">Moderate (40-70%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-400 rounded"></div>
                            <span className="text-sm">Partially Full (70-90%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-400 rounded"></div>
                            <span className="text-sm">Almost Full (90%+)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-600 rounded"></div>
                            <span className="text-sm">Full</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-400 rounded"></div>
                            <span className="text-sm">Maintenance</span>
                        </div>
                    </div>
                </div>

                {/* ========== REAL 3D WAREHOUSE RACK VIEW ========== */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6 overflow-x-auto">
                    {Object.keys(warehouseMap).length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            No bins found matching the filters
                        </div>
                    ) : (
                        Object.keys(warehouseMap)
                            .sort((a, b) => Number(a) - Number(b))
                            .map((aisle) => (
                                <div key={aisle} className="mb-10">
                                    {/* Aisle Header */}
                                    <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-amber-200">
                                        <FaCube className="text-amber-500 text-xl" />
                                        <h2 className="text-2xl font-bold text-amber-600">
                                            AISLE {aisle}
                                        </h2>
                                        <span className="text-sm text-gray-400">
                                            {Object.keys(warehouseMap[aisle]).length} Bays
                                        </span>
                                    </div>

                                    {/* Bays/Rows - Horizontal Scroll */}
                                    <div className="flex gap-6 overflow-x-auto pb-4">
                                        {Object.keys(warehouseMap[aisle])
                                            .sort((a, b) => Number(a) - Number(b))
                                            .map((bay) => (
                                                <div
                                                    key={bay}
                                                    className="min-w-[180px] bg-slate-50 dark:bg-slate-900 rounded-xl border p-3 shadow-sm"
                                                >
                                                    {/* Bay Header */}
                                                    <div className="text-center font-bold text-lg mb-3 pb-2 border-b">
                                                        Bay {bay}
                                                    </div>

                                                    {/* Rack Levels - Vertical Stack (Z axis) */}
                                                    <div className="flex flex-col-reverse gap-2">
                                                        {Object.keys(warehouseMap[aisle][bay])
                                                            .sort((a, b) => Number(a) - Number(b))
                                                            .map((level) => (
                                                                <div
                                                                    key={level}
                                                                    className="border rounded-lg bg-white dark:bg-slate-800 overflow-hidden"
                                                                >
                                                                    {/* Level Label */}
                                                                    <div className="bg-gray-100 dark:bg-slate-700 px-2 py-1 text-xs font-bold text-center border-b">
                                                                        LEVEL {level}
                                                                    </div>

                                                                    {/* Bins in this Level */}
                                                                    <div className="p-2 space-y-2">
                                                                        {warehouseMap[aisle][bay][level].map((bin) => {
                                                                            const utilization = getBinUtilization(bin);
                                                                            const color = getBinColor(utilization, bin.status);

                                                                            return (
                                                                                <button
                                                                                    key={bin._id}
                                                                                    onClick={() => {
                                                                                        setSelectedBin(bin);
                                                                                        setShowDetailsModal(true);
                                                                                    }}
                                                                                    className={`
                                                                                        w-full bg-gradient-to-br ${color}
                                                                                        text-white rounded-lg p-2
                                                                                        transition-all hover:scale-105
                                                                                        shadow-md
                                                                                    `}
                                                                                >
                                                                                    <div className="text-xs font-bold truncate">
                                                                                        {bin.code}
                                                                                    </div>
                                                                                    <div className="text-[10px] opacity-90">
                                                                                        {utilization.toFixed(0)}% used
                                                                                    </div>
                                                                                    <div className="text-[9px] font-mono opacity-75 mt-1">
                                                                                        X:{bin.x} Y:{bin.y} Z:{bin.z}
                                                                                    </div>
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))
                    )}
                </div>

                {/* Zone Summary */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {zones.slice(0, isMobile ? 2 : 3).map((zone) => {
                        const zoneBins = bins.filter((b) => getZoneFromCode(b.code) === zone);
                        const zoneUtilization = zoneBins.reduce((sum, b) => sum + getBinUtilization(b), 0) / zoneBins.length || 0;
                        return (
                            <div key={zone} className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                                <h3 className="font-semibold mb-2 text-sm truncate">{zone}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Total Bins:</span>
                                        <span className="font-semibold">{zoneBins.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Utilization:</span>
                                        <span className="font-semibold">{zoneUtilization.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-amber-500 h-2 rounded-full transition-all"
                                            style={{ width: `${zoneUtilization}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bin Details Modal */}
            <BinDetailsModal
                open={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                bin={selectedBin}
                inventory={inventory}
                refresh={fetchData}
            />
        </DashboardLayout>
    );
}

export default WarehouseMap;