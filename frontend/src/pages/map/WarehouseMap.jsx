
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
    FaChevronLeft,
    FaChevronRight,
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
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchData();
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        if (mobile) {
            setRowsPerPage(5);
        } else {
            setRowsPerPage(10);
        }
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

    // Pagination for rows
    const rowKeys = Object.keys(rows).sort((a, b) => Number(a) - Number(b));
    const totalPages = Math.ceil(rowKeys.length / rowsPerPage);
    const paginatedRows = rowKeys.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

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
                {/* Header - Responsive */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                            Warehouse Map
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                            Visual representation of bin locations and utilization
                        </p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl flex items-center gap-2 transition text-sm sm:text-base w-full sm:w-auto justify-center"
                    >
                        <FaMapMarkedAlt className="text-sm sm:text-base" />
                        <span>Refresh Map</span>
                    </button>
                </div>

                {/* Statistics Panel - Responsive Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 md:mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm">Total Bins</p>
                                <h2 className="text-xl sm:text-2xl font-bold">{stats.total}</h2>
                            </div>
                            <FaWarehouse className="text-amber-500 text-xl sm:text-2xl" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm">Available</p>
                                <h2 className="text-xl sm:text-2xl font-bold text-green-600">{stats.available}</h2>
                            </div>
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm">Full</p>
                                <h2 className="text-xl sm:text-2xl font-bold text-red-600">{stats.full}</h2>
                            </div>
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm">Maintenance</p>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-600">{stats.maintenance}</h2>
                            </div>
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full"></div>
                        </div>
                    </div>
                    <div className="col-span-2 md:col-span-1 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs sm:text-sm">Utilization</p>
                                <h2 className="text-xl sm:text-2xl font-bold text-blue-600">
                                    {stats.utilization.toFixed(1)}%
                                </h2>
                            </div>
                            <FaChartPie className="text-blue-500 text-xl sm:text-2xl" />
                        </div>
                    </div>
                </div>

                {/* Controls - Responsive with Mobile Filter Button */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                        <input
                            type="text"
                            placeholder="Search bin by code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 border rounded-xl py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:border-slate-700"
                        />
                    </div>

                    {/* Desktop Filters */}
                    <div className="hidden sm:flex gap-3">
                        <select
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                            className="border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:border-slate-700"
                        >
                            <option value="all">All Zones</option>
                            {zones.map((zone) => (
                                <option key={zone} value={zone}>
                                    {zone}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Mobile Filter Button */}
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="sm:hidden flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-800 border rounded-xl px-4 py-2"
                    >
                        <FaFilter />
                        <span>Filters</span>
                        {selectedZone !== "all" && (
                            <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                                1
                            </span>
                        )}
                    </button>
                </div>

                {/* Mobile Filters Modal */}
                {showMobileFilters && isMobile && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 sm:hidden">
                        <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm">
                            <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                                <h3 className="font-semibold">Filter Zones</h3>
                                <button onClick={() => setShowMobileFilters(false)}>
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="p-4">
                                <select
                                    value={selectedZone}
                                    onChange={(e) => {
                                        setSelectedZone(e.target.value);
                                        setShowMobileFilters(false);
                                    }}
                                    className="w-full border rounded-xl px-4 py-3 dark:bg-slate-700 dark:border-slate-600"
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
                    </div>
                )}

                {/* Legend - Responsive */}
                <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4 mb-6 overflow-x-auto">
                    <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <FaLayerGroup className="text-sm sm:text-base" /> Legend
                    </h3>
                    <div className="flex flex-wrap gap-3 sm:gap-6">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
                            <span className="text-xs sm:text-sm">Available (&lt;40%)</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded"></div>
                            <span className="text-xs sm:text-sm">Moderate (40-70%)</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-400 rounded"></div>
                            <span className="text-xs sm:text-sm">Partially Full (70-90%)</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-400 rounded"></div>
                            <span className="text-xs sm:text-sm">Almost Full (90%+)</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded"></div>
                            <span className="text-xs sm:text-sm">Full</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-400 rounded"></div>
                            <span className="text-xs sm:text-sm">Maintenance</span>
                        </div>
                    </div>
                </div>

                {/* Warehouse Grid Map - Fully Responsive with Horizontal Scroll on Mobile */}
                <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-6 overflow-x-auto">
                    {Object.keys(rows).length === 0 ? (
                        <div className="text-center py-10 sm:py-20 text-gray-500 text-sm sm:text-base">
                            No bins found in this zone
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 sm:space-y-6 min-w-[600px] md:min-w-0">
                                {paginatedRows.map((row) => (
                                    <div key={row}>
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                            <div className="w-auto sm:w-16 text-xs sm:text-sm font-semibold text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 sm:px-0 py-1 sm:py-0 rounded sm:bg-transparent">
                                                Row {row}
                                            </div>
                                            <div className="flex-1 flex flex-wrap gap-1 sm:gap-2">
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
                                                                flex-1 min-w-[60px] sm:min-w-[80px] 
                                                                p-2 sm:p-3 rounded-lg sm:rounded-xl 
                                                                text-center transition-all
                                                                ${binColor} hover:opacity-80 
                                                                active:scale-95 sm:hover:scale-105
                                                                text-white shadow-sm
                                                            `}
                                                            title={`${bin.code} - ${binStatus} - ${itemCount} items`}
                                                        >
                                                            <div className="text-[10px] sm:text-xs font-mono font-semibold truncate">
                                                                {bin.code}
                                                            </div>
                                                            <div className="text-[8px] sm:text-xs mt-0.5 sm:mt-1 opacity-90">
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

                            {/* Pagination for mobile */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-6 pt-4 border-t dark:border-slate-700">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-100 dark:bg-slate-700 rounded-lg disabled:opacity-50 text-sm sm:text-base"
                                    >
                                        <FaChevronLeft className="inline mr-1" size={12} /> Prev
                                    </button>
                                    <span className="text-xs sm:text-sm">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 sm:px-4 py-1 sm:py-2 bg-gray-100 dark:bg-slate-700 rounded-lg disabled:opacity-50 text-sm sm:text-base"
                                    >
                                        Next <FaChevronRight className="inline ml-1" size={12} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Zone Summary - Responsive Grid */}
                <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {zones.slice(0, isMobile ? 2 : 3).map((zone) => {
                        const zoneBins = bins.filter((b) => getZoneFromCode(b.code) === zone);
                        const zoneUtilization =
                            zoneBins.reduce((sum, b) => sum + getBinUtilization(b), 0) / zoneBins.length || 0;
                        return (
                            <div key={zone} className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                                <h3 className="font-semibold mb-2 text-sm sm:text-base truncate" title={zone}>
                                    {zone.length > 20 ? zone.substring(0, 20) + "..." : zone}
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-500">Total Bins:</span>
                                        <span className="font-semibold">{zoneBins.length}</span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-500">Utilization:</span>
                                        <span className="font-semibold">{zoneUtilization.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                                        <div
                                            className="bg-amber-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${zoneUtilization}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* View More Zones Button for Mobile */}
                {!isMobile && zones.length > 3 && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setCurrentPage(1)}
                            className="text-amber-500 text-sm hover:underline"
                        >
                            View all {zones.length} zones in map above ↑
                        </button>
                    </div>
                )}
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
