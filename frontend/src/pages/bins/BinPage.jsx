
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import BinFormModal from "../../components/bins/BinFormModal";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaWarehouse,
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaLocationArrow,
    FaCube,
    FaWeightHanging,
    FaChartLine,
    FaArrowsAltV,
    FaLayerGroup,
    FaExclamationTriangle,
    FaBan,
    FaTools,
} from "react-icons/fa";
import toast from "react-hot-toast";

function BinPage() {
    const [bins, setBins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedBin, setSelectedBin] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [binToDeactivate, setBinToDeactivate] = useState(null);

    const fetchBins = async () => {
        try {
            setLoading(true);
            const res = await api.get("/bins");
            setBins(res.data.data || []);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch bins");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBins();
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        setItemsPerPage(mobile ? 5 : 10);
        setCurrentPage(1);
    };

    // Deactivate bin (instead of delete)
    const handleDeactivate = async (bin, reason = "MAINTENANCE") => {
        try {
            // First check if bin has inventory
            const inventoryRes = await api.get(`/inventory?bin=${bin._id}`);
            const inventoryInBin = inventoryRes.data.data || [];

            if (inventoryInBin.length > 0) {
                toast.error(`Cannot deactivate bin. ${inventoryInBin.length} item(s) still in this bin. Please move stock first.`);
                return;
            }

            // Deactivate the bin
            await api.put(`/bins/${bin._id}/deactivate`, {
                status: reason === "MAINTENANCE" ? "MAINTENANCE" : "INACTIVE"
            });

            toast.success(`Bin ${bin.code} deactivated successfully`);
            fetchBins();
            setShowDeactivateModal(false);
            setBinToDeactivate(null);
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Failed to deactivate bin");
        }
    };

    //Activate bin (reactivate)
    const handleActivate = async (bin) => {
        try {
            await api.put(`/bins/${bin._id}/activate`, {
                status: "AVAILABLE"
            });
            toast.success(`Bin ${bin.code} activated successfully`);
            fetchBins();
        } catch (error) {
            console.log(error);
            toast.error("Failed to activate bin");
        }
    };

    // Hard delete (only for empty bins with admin confirmation)
    const handleHardDelete = async (bin) => {
        const confirmDelete = window.confirm(
            `⚠️ WARNING: This will permanently delete bin ${bin.code}.\n\n` +
            `This action cannot be undone.\n\n` +
            `Only proceed if bin has no stock and you want to permanently remove it.`
        );

        if (!confirmDelete) return;

        try {
            // Check if bin has inventory
            const inventoryRes = await api.get(`/inventory?bin=${bin._id}`);
            const inventoryInBin = inventoryRes.data.data || [];

            if (inventoryInBin.length > 0) {
                toast.error(`Cannot delete bin. ${inventoryInBin.length} item(s) still in this bin. Move stock first.`);
                return;
            }

            await api.delete(`/bins/${bin._id}/hard`);
            toast.success(`Bin ${bin.code} permanently deleted`);
            fetchBins();
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Failed to delete bin");
        }
    };

    const filteredBins = bins.filter((bin) =>
        bin.code?.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredBins.length / itemsPerPage);
    const paginatedBins = filteredBins.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Calculate stats
    const totalBins = bins.length;
    const availableBins = bins.filter((bin) => bin.status === "AVAILABLE").length;
    const fullBins = bins.filter((bin) => bin.status === "FULL").length;
    const maintenanceBins = bins.filter((bin) => bin.status === "MAINTENANCE" || bin.status === "INACTIVE").length;

    const getStatusColor = (status) => {
        const colors = {
            AVAILABLE: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            FULL: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
            MAINTENANCE: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
            INACTIVE: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        };
        return colors[status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    const getStatusIcon = (status) => {
        const icons = {
            AVAILABLE: "✅",
            FULL: "📦",
            MAINTENANCE: "🔧",
            INACTIVE: "❌",
        };
        return icons[status] || "📋";
    };

    // Deactivate Modal
    const DeactivateModal = () => {
        if (!showDeactivateModal || !binToDeactivate) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6">
                    <h2 className="text-xl font-bold mb-4">Deactivate Bin</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Are you sure you want to deactivate bin <span className="font-mono font-bold">{binToDeactivate.code}</span>?
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                        Deactivated bins will not be used for new putaway tasks.
                        You can reactivate them later.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setShowDeactivateModal(false);
                                setBinToDeactivate(null);
                            }}
                            className="flex-1 px-4 py-2 border rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleDeactivate(binToDeactivate, "MAINTENANCE")}
                            className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                        >
                            Deactivate
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                                Bin Master
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                                Manage warehouse bins and storage locations
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedBin(null);
                                setOpenModal(true);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl flex items-center gap-2 transition shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
                        >
                            <FaPlus className="text-sm sm:text-base" />
                            <span>Create Bin</span>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Bins</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{totalBins}</h2>
                                </div>
                                <FaWarehouse className="text-amber-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Available</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-green-600">{availableBins}</h2>
                                </div>
                                <span className="text-xl">✅</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Full</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-orange-600">{fullBins}</h2>
                                </div>
                                <span className="text-xl">📦</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Maintenance/Inactive</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-red-600">{maintenanceBins}</h2>
                                </div>
                                <FaTools className="text-red-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="text"
                                placeholder="Search bin by code..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full sm:w-96 border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white transition"
                            />
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    {isMobile && (
                        <div className="space-y-3 mb-6">
                            {loading ? (
                                <div className="text-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                                </div>
                            ) : paginatedBins.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    No bins found
                                </div>
                            ) : (
                                paginatedBins.map((bin) => (
                                    <div key={bin._id} className="bg-white dark:bg-slate-800 rounded-xl border p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <FaWarehouse className="text-amber-500" />
                                                    <h3 className="font-semibold font-mono text-base">{bin.code}</h3>
                                                </div>
                                                {/* Coordinates - Show X, Y, Z */}
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <div className="flex items-center gap-1">
                                                        <FaLocationArrow className="text-gray-400 text-xs" />
                                                        <p className="text-xs text-gray-500 font-mono">X: {bin.x || 0}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FaArrowsAltV className="text-gray-400 text-xs rotate-90" />
                                                        <p className="text-xs text-gray-500 font-mono">Y: {bin.y || 0}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <FaLayerGroup className="text-gray-400 text-xs" />
                                                        <p className="text-xs text-gray-500 font-mono">Z: {bin.z || 1}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bin.status)}`}>
                                                <span>{getStatusIcon(bin.status)}</span>
                                                <span>{bin.status}</span>
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-3 pt-2 border-t dark:border-slate-700">
                                            <div>
                                                <p className="text-xs text-gray-500">Volume Capacity</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <FaCube className="text-gray-400 text-xs" />
                                                    <p className="text-sm font-semibold">{bin.volumeCapacity} cu</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Max Weight</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <FaWeightHanging className="text-gray-400 text-xs" />
                                                    <p className="text-sm font-semibold">{bin.maxWeight || 0} kg</p>
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-gray-500">Remaining Capacity</p>
                                                <div className="mt-1">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span>{bin.remainingVolume || 0} cu</span>
                                                        <span className="text-gray-500">{Math.round(((bin.remainingVolume || 0) / bin.volumeCapacity) * 100)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                                                        <div
                                                            className="bg-amber-500 h-1.5 rounded-full transition-all"
                                                            style={{
                                                                width: `${((bin.remainingVolume || 0) / bin.volumeCapacity) * 100}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-gray-500">Handling Classes</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {bin.allowedHandlingClasses?.slice(0, 3).map((item) => (
                                                        <span
                                                            key={item}
                                                            className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs"
                                                        >
                                                            {item.toLowerCase().replace(/_/g, " ")}
                                                        </span>
                                                    ))}
                                                    {bin.allowedHandlingClasses?.length > 3 && (
                                                        <span className="text-xs text-gray-500">
                                                            +{bin.allowedHandlingClasses.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 🟢 UPDATED: Action Buttons */}
                                        <div className="flex justify-end gap-3 pt-2 border-t dark:border-slate-700">
                                            <button
                                                onClick={() => {
                                                    setSelectedBin(bin);
                                                    setOpenModal(true);
                                                }}
                                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                title="Edit Bin"
                                            >
                                                <FaEdit />
                                            </button>

                                            {bin.status === "AVAILABLE" || bin.status === "FULL" ? (
                                                <button
                                                    onClick={() => {
                                                        setBinToDeactivate(bin);
                                                        setShowDeactivateModal(true);
                                                    }}
                                                    className="p-2 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition"
                                                    title="Deactivate Bin"
                                                >
                                                    <FaBan />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleActivate(bin)}
                                                    className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                                                    title="Activate Bin"
                                                >
                                                    <FaWarehouse />
                                                </button>
                                            )}

                                            {/* Hard Delete - Only for empty bins, hidden by default */}
                                            {/* <button
                                                onClick={() => handleHardDelete(bin)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                title="Permanently Delete (Empty Bins Only)"
                                            >
                                                <FaTrash />
                                            </button> */}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Desktop Table View */}
                    {!isMobile && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-slate-700">
                                        <tr className="border-b dark:border-slate-600">
                                            <th className="p-4 text-left text-sm font-semibold">Bin Code</th>
                                            <th className="p-4 text-left text-sm font-semibold">Coordinates (X,Y,Z)</th>
                                            <th className="p-4 text-left text-sm font-semibold">Volume</th>
                                            <th className="p-4 text-left text-sm font-semibold">Max Weight</th>
                                            <th className="p-4 text-left text-sm font-semibold">Remaining</th>
                                            <th className="p-4 text-left text-sm font-semibold">Handling</th>
                                            <th className="p-4 text-left text-sm font-semibold">Status</th>
                                            <th className="p-4 text-center text-sm font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="8" className="text-center py-10">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                                                </td>
                                            </tr>
                                        ) : paginatedBins.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="text-center py-10 text-gray-500">
                                                    No bins found
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedBins.map((bin) => (
                                                <tr key={bin._id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <FaWarehouse className="text-amber-500" />
                                                            <h3 className="font-semibold font-mono text-sm">{bin.code}</h3>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-1 flex-wrap">
                                                            <FaLocationArrow className="text-gray-400 text-xs" />
                                                            <span className="font-mono text-sm">X:{bin.x || 0}</span>
                                                            <span className="text-gray-400">,</span>
                                                            <FaArrowsAltV className="text-gray-400 text-xs rotate-90" />
                                                            <span className="font-mono text-sm">Y:{bin.y || 0}</span>
                                                            <span className="text-gray-400">,</span>
                                                            <FaLayerGroup className="text-gray-400 text-xs" />
                                                            <span className="font-mono text-sm">Z:{bin.z || 1}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-1">
                                                            <FaCube className="text-gray-400 text-xs" />
                                                            <span className="text-sm">{bin.volumeCapacity} cu</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-1">
                                                            <FaWeightHanging className="text-gray-400 text-xs" />
                                                            <span className="text-sm">{bin.maxWeight || 0} kg</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col min-w-[100px]">
                                                            <div className="flex justify-between text-xs mb-1">
                                                                <span>{bin.remainingVolume || 0} cu</span>
                                                                <span className="text-gray-500">{Math.round(((bin.remainingVolume || 0) / bin.volumeCapacity) * 100)}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-amber-500 h-1.5 rounded-full transition-all"
                                                                    style={{
                                                                        width: `${((bin.remainingVolume || 0) / bin.volumeCapacity) * 100}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {bin.allowedHandlingClasses?.slice(0, 2).map((item) => (
                                                                <span
                                                                    key={item}
                                                                    className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs"
                                                                >
                                                                    {item.toLowerCase().replace(/_/g, " ")}
                                                                </span>
                                                            ))}
                                                            {bin.allowedHandlingClasses?.length > 2 && (
                                                                <span className="text-xs text-gray-500">
                                                                    +{bin.allowedHandlingClasses.length - 2}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bin.status)}`}>
                                                            <span>{getStatusIcon(bin.status)}</span>
                                                            <span>{bin.status}</span>
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedBin(bin);
                                                                    setOpenModal(true);
                                                                }}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                                title="Edit Bin"
                                                            >
                                                                <FaEdit />
                                                            </button>

                                                            {bin.status === "AVAILABLE" || bin.status === "FULL" ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setBinToDeactivate(bin);
                                                                        setShowDeactivateModal(true);
                                                                    }}
                                                                    className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition"
                                                                    title="Deactivate Bin"
                                                                >
                                                                    <FaBan />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleActivate(bin)}
                                                                    className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                                                                    title="Activate Bin"
                                                                >
                                                                    <FaWarehouse />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredBins.length > 0 && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t dark:border-slate-700">
                            <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                                Showing {paginatedBins.length} of {filteredBins.length} bins
                            </div>
                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                                >
                                    <FaChevronLeft className="inline mr-1" size={12} /> Prev
                                </button>
                                <span className="text-xs sm:text-sm">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                                >
                                    Next <FaChevronRight className="inline ml-1" size={12} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Deactivate Modal */}
            <DeactivateModal />

            {/* Bin Form Modal */}
            <BinFormModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedBin(null);
                }}
                selectedBin={selectedBin}
                refresh={fetchBins}
            />
        </DashboardLayout>
    );
}

export default BinPage;