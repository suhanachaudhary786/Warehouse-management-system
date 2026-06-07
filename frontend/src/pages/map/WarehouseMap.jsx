
// pages/WarehouseMap.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import {
    FaMapMarkedAlt,
    FaWarehouse,
    FaSearch,
    FaLayerGroup,
    FaChartPie,
} from "react-icons/fa";
import BinDetailsModal from "../../components/warehouse/BinDetailsModal";
import toast from "react-hot-toast";

function WarehouseMap() {
    const [bins, setBins] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBin, setSelectedBin] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

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
        if (status === "FULL") return "bg-red-500";
        if (status === "MAINTENANCE") return "bg-gray-400";
        if (utilization >= 90) return "bg-red-400";
        if (utilization >= 70) return "bg-orange-400";
        if (utilization >= 40) return "bg-yellow-400";
        return "bg-green-500";
    };

    // Get bin status text
    const getBinStatus = (bin, utilization) => {
        if (bin.status === "FULL") return "Full";
        if (bin.status === "MAINTENANCE") return "Maintenance";
        if (utilization >= 90) return "Almost Full";
        if (utilization >= 70) return "Partially Full";
        if (utilization >= 40) return "Moderate";
        return "Available";
    };

    // Group bins by zone (based on bin code prefix)
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

    // Filter bins
    const filteredBins = bins.filter((bin) => {
        const matchesZone = selectedZone === "all" || getZoneFromCode(bin.code) === selectedZone;
        const matchesSearch = bin.code?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesZone && matchesSearch;
    });

    // Group bins by row (based on y-coordinate or code)
    const groupBinsByRow = (binsList) => {
        const rows = {};
        binsList.forEach((bin) => {
            const row = bin.y || Math.floor(parseInt(bin.code?.split("-")[1]) / 10) || 0;
            if (!rows[row]) rows[row] = [];
            rows[row].push(bin);
        });
        // Sort bins in each row by x-coordinate
        Object.keys(rows).forEach((row) => {
            rows[row].sort((a, b) => (a.x || 0) - (b.x || 0));
        });
        return rows;
    };

    const rows = groupBinsByRow(filteredBins);

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
            <div className="p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                            Warehouse Map
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Visual representation of bin locations and utilization
                        </p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition"
                    >
                        <FaMapMarkedAlt /> Refresh Map
                    </button>
                </div>

                {/* Statistics Panel */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search bin by code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 border rounded-xl py-3 focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                            className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="all">All Zones</option>
                            {zones.map((zone) => (
                                <option key={zone} value={zone}>
                                    {zone}
                                </option>
                            ))}
                        </select>
                    </div>
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
                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                            <span className="text-sm">Full</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-400 rounded"></div>
                            <span className="text-sm">Maintenance</span>
                        </div>
                    </div>
                </div>

                {/* Warehouse Grid Map */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6 overflow-x-auto">
                    {Object.keys(rows).length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            No bins found in this zone
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.keys(rows)
                                .sort((a, b) => Number(a) - Number(b))
                                .map((row) => (
                                    <div key={row}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-16 text-sm font-semibold text-gray-500">
                                                Row {row}
                                            </div>
                                            <div className="flex-1 flex gap-2">
                                                {rows[row].map((bin) => {
                                                    const utilization = getBinUtilization(bin);
                                                    const binColor = getBinColor(utilization, bin.status);
                                                    const binStatus = getBinStatus(bin, utilization);
                                                    const itemCount = inventory.filter(
                                                        (i) => i.bin?._id === bin._id || i.bin === bin._id
                                                    ).length;

                                                    return (
                                                        <button
                                                            key={bin._id}
                                                            onClick={() => {
                                                                setSelectedBin(bin);
                                                                setShowDetailsModal(true);
                                                            }}
                                                            className={`
                                flex-1 min-w-[80px] p-3 rounded-xl text-center transition-all
                                ${binColor} hover:opacity-80 hover:scale-105
                                text-white shadow-sm
                              `}
                                                            title={`${bin.code} - ${binStatus} - ${itemCount} items`}
                                                        >
                                                            <div className="text-xs font-mono font-semibold">
                                                                {bin.code}
                                                            </div>
                                                            <div className="text-xs mt-1 opacity-90">
                                                                {utilization.toFixed(0)}%
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {/* Zone Summary */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {zones.slice(0, 3).map((zone) => {
                        const zoneBins = bins.filter((b) => getZoneFromCode(b.code) === zone);
                        const zoneUtilization =
                            zoneBins.reduce((sum, b) => sum + getBinUtilization(b), 0) / zoneBins.length || 0;
                        return (
                            <div key={zone} className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                                <h3 className="font-semibold mb-2">{zone}</h3>
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
                                            className="bg-amber-500 h-2 rounded-full"
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