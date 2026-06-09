
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import {
    FaTruck,
    FaBox,
    FaCheckCircle,
    FaClock,
    FaSearch,
    FaFilter,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaMapMarker,
    FaCalendar,
    FaShippingFast,
} from "react-icons/fa";
import toast from "react-hot-toast";

function WorkerShipments() {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    useEffect(() => {
        fetchMyShipments();
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        setItemsPerPage(mobile ? 3 : 5);
        setCurrentPage(1);
    };

    const fetchMyShipments = async () => {
        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            const res = await api.get(`/shipments/worker/${userData._id}`);
            setShipments(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch shipments");
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: "📝",
            label_generated: "🏷️",
            picked_up: "📦",
            in_transit: "🚚",
            out_for_delivery: "🚛",
            delivered: "✅",
            failed: "❌",
            returned: "🔄",
        };
        return icons[status] || "📦";
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
            label_generated: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            picked_up: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
            in_transit: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
            out_for_delivery: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
            delivered: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            failed: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
            returned: "bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
        };
        return colors[status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    const getStatusDisplay = (status) => {
        return status?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || status;
    };

    const getDeliveryProgress = (status) => {
        const progress = {
            pending: 0,
            label_generated: 20,
            picked_up: 40,
            in_transit: 60,
            out_for_delivery: 80,
            delivered: 100,
        };
        return progress[status] || 0;
    };

    // Filter shipments
    const filteredShipments = shipments.filter(shipment => {
        const matchesSearch = searchTerm === "" ||
            shipment.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shipment.order?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shipment.carrier?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter ? shipment.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
    const paginatedShipments = filteredShipments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const stats = {
        total: shipments.length,
        inTransit: shipments.filter(s => s.status === "in_transit").length,
        delivered: shipments.filter(s => s.status === "delivered").length,
        pending: shipments.filter(s => s.status === "pending" || s.status === "label_generated" || s.status === "picked_up").length,
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
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                    {/* Header - Responsive */}
                    <div className="mb-6 md:mb-8">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                            My Shipments
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                            Track and monitor your shipments
                        </p>
                    </div>

                    {/* Stats Cards - Responsive Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Shipments</p>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</h2>
                                </div>
                                <FaShippingFast className="text-blue-500 text-2xl sm:text-3xl" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">In Transit</p>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.inTransit}</h2>
                                </div>
                                <FaTruck className="text-yellow-500 text-2xl sm:text-3xl" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Delivered</p>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{stats.delivered}</h2>
                                </div>
                                <FaCheckCircle className="text-green-500 text-2xl sm:text-3xl" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.pending}</h2>
                                </div>
                                <FaClock className="text-purple-500 text-2xl sm:text-3xl" />
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter - Responsive */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="text"
                                placeholder="Search by tracking #, order #, or carrier..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border dark:border-slate-700 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white transition"
                            />
                        </div>

                        {/* Desktop Filter */}
                        <div className="hidden sm:block">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:border-slate-700"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="label_generated">Label Generated</option>
                                <option value="picked_up">Picked Up</option>
                                <option value="in_transit">In Transit</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="failed">Failed</option>
                                <option value="returned">Returned</option>
                            </select>
                        </div>

                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="sm:hidden flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-800 border rounded-xl px-4 py-2"
                        >
                            <FaFilter />
                            <span>Filter</span>
                            {statusFilter && (
                                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    1
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Mobile Filter Modal */}
                    {showMobileFilters && isMobile && (
                        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm">
                                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                                    <h3 className="font-semibold text-lg">Filter Shipments</h3>
                                    <button onClick={() => setShowMobileFilters(false)} className="p-1">
                                        <FaTimes />
                                    </button>
                                </div>
                                <div className="p-4">
                                    <label className="block text-sm font-medium mb-2">Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setCurrentPage(1);
                                            setShowMobileFilters(false);
                                        }}
                                        className="w-full border rounded-xl px-4 py-3 dark:bg-slate-700 dark:border-slate-600"
                                    >
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="label_generated">Label Generated</option>
                                        <option value="picked_up">Picked Up</option>
                                        <option value="in_transit">In Transit</option>
                                        <option value="out_for_delivery">Out for Delivery</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="failed">Failed</option>
                                        <option value="returned">Returned</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipments List */}
                    {filteredShipments.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-8 sm:p-12 text-center">
                            <FaTruck className="text-4xl sm:text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No shipments found</p>
                            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                                {searchTerm || statusFilter ? "Try changing your search or filter" : "When shipments are created, they will appear here"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 sm:space-y-4">
                                {paginatedShipments.map((shipment) => (
                                    <div key={shipment._id} className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-4 sm:p-5 shadow-sm hover:shadow-md transition">
                                        {/* Header */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                                            <div>
                                                <p className="font-mono font-bold text-sm sm:text-base text-gray-800 dark:text-white">
                                                    {shipment.trackingNumber}
                                                </p>
                                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                    Order: {shipment.order?.orderNumber}
                                                </p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                                                <span>{getStatusIcon(shipment.status)}</span>
                                                <span className="capitalize">{getStatusDisplay(shipment.status)}</span>
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-3 mb-3">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>Delivery Progress</span>
                                                <span>{getDeliveryProgress(shipment.status)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                                                <div
                                                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${getDeliveryProgress(shipment.status)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Shipment Details Grid */}
                                        <div className="border-t dark:border-slate-700 pt-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Carrier</p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <FaTruck className="text-gray-400 text-xs" />
                                                        <p className="text-sm font-medium text-gray-800 dark:text-white capitalize">
                                                            {shipment.carrier?.replace(/_/g, " ")}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Service Type</p>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-white capitalize">
                                                        {shipment.serviceType || "Standard"}
                                                    </p>
                                                </div>
                                                {shipment.estimatedDelivery && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Est. Delivery</p>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <FaCalendar className="text-gray-400 text-xs" />
                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {shipment.actualDelivery && (
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Actual Delivery</p>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <FaCheckCircle className="text-green-500 text-xs" />
                                                            <p className="text-sm text-green-600 dark:text-green-400">
                                                                {new Date(shipment.actualDelivery).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Package Details */}
                                        {shipment.packageDetails && (
                                            <div className="mt-3 pt-3 border-t dark:border-slate-700">
                                                <div className="grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <span className="text-gray-500">Weight:</span>
                                                        <span className="ml-1 font-medium text-gray-800 dark:text-white">
                                                            {shipment.packageDetails.weight} kg
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Dimensions:</span>
                                                        <span className="ml-1 font-medium text-gray-800 dark:text-white">
                                                            {shipment.packageDetails.dimensions?.length}×{shipment.packageDetails.dimensions?.width}×{shipment.packageDetails.dimensions?.height} cm
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Status-specific Messages */}
                                        {shipment.status === "in_transit" && (
                                            <div className="mt-3 pt-3 border-t dark:border-slate-700">
                                                <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400">
                                                    <FaTruck className="text-sm" />
                                                    <span>Your package is on the way!</span>
                                                </div>
                                            </div>
                                        )}

                                        {shipment.status === "out_for_delivery" && (
                                            <div className="mt-3 pt-3 border-t dark:border-slate-700">
                                                <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                                                    <FaMapMarker className="text-sm" />
                                                    <span>Out for delivery today!</span>
                                                </div>
                                            </div>
                                        )}

                                        {shipment.status === "delivered" && (
                                            <div className="mt-3 pt-3 border-t dark:border-slate-700">
                                                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                                    <FaCheckCircle className="text-sm" />
                                                    <span>Package delivered successfully!</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t dark:border-slate-700">
                                    <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                                        Showing {paginatedShipments.length} of {filteredShipments.length} shipments
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
                        </>
                    )}

                    {/* Refresh Button */}
                    <div className="mt-6 sm:mt-8 text-center">
                        <button
                            onClick={fetchMyShipments}
                            className="text-amber-500 hover:text-amber-600 flex items-center gap-2 mx-auto text-sm sm:text-base"
                        >
                            <FaTruck />
                            Refresh Shipments
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default WorkerShipments;