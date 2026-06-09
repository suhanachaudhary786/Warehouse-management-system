
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import CreateShipmentModal from "../../components/shipments/CreateShipmentModal";
import ShipmentDetailsModal from "../../components/shipments/ShipmentDetailsModal";
import UpdateStatusModal from "../../components/shipments/UpdateStatusModal";
import {
    FaPlus,
    FaEye,
    FaTruck,
    FaBox,
    FaSearch,
    FaDownload,
    FaMapMarker,
    FaFilter,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaCalendar,
} from "react-icons/fa";
import toast from "react-hot-toast";

function Shipments() {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchShipments = async () => {
        try {
            setLoading(true);
            const res = await api.get("/shipments");
            setShipments(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch shipments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShipments();
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

    const handleUpdateStatus = async (id, statusData) => {
        try {
            await api.put(`/shipments/${id}`, statusData);
            toast.success("Shipment status updated");
            fetchShipments();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
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
        return icons[status] || "📋";
    };

    const getStatusDisplay = (status) => {
        return status?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || status;
    };

    // Filter shipments
    const filteredShipments = shipments.filter((shipment) => {
        const matchesSearch =
            shipment.shipmentNumber?.toLowerCase().includes(search.toLowerCase()) ||
            shipment.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
            shipment.order?.customerName?.toLowerCase().includes(search.toLowerCase()) ||
            shipment.order?.orderNumber?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter ? shipment.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
    const paginatedShipments = filteredShipments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Stats
    const stats = {
        total: shipments.length,
        inTransit: shipments.filter(s => ["picked_up", "in_transit", "out_for_delivery"].includes(s.status)).length,
        delivered: shipments.filter(s => s.status === "delivered").length,
        failed: shipments.filter(s => s.status === "failed").length,
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                    {/* Header - Responsive */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                                Shipments
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                                Manage and track all shipments
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedShipment(null);
                                setOpenModal(true);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl flex items-center gap-2 transition shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
                        >
                            <FaPlus className="text-sm sm:text-base" />
                            <span>Create Shipment</span>
                        </button>
                    </div>

                    {/* Stats Cards - Responsive Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Shipments</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</h2>
                                </div>
                                <FaBox className="text-amber-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">In Transit</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.inTransit}</h2>
                                </div>
                                <FaTruck className="text-yellow-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Delivered</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-green-600">{stats.delivered}</h2>
                                </div>
                                <FaMapMarker className="text-green-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Failed</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-red-600">{stats.failed}</h2>
                                </div>
                                <FaBox className="text-red-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters - Responsive */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="text"
                                placeholder="Search by shipment #, tracking #, order #, or customer..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 border rounded-xl py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:border-slate-700"
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
                                className="border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:border-slate-700"
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

                    {/* Mobile Card View */}
                    {isMobile && (
                        <div className="space-y-3 mb-6">
                            {loading ? (
                                <div className="text-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                                </div>
                            ) : paginatedShipments.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    No shipments found
                                </div>
                            ) : (
                                paginatedShipments.map((shipment) => (
                                    <div key={shipment._id} className="bg-white dark:bg-slate-800 rounded-xl border p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-mono font-semibold text-sm">{shipment.shipmentNumber}</p>
                                                <p className="font-mono text-xs text-gray-500 mt-1">Track: {shipment.trackingNumber}</p>
                                            </div>
                                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                                                <span>{getStatusIcon(shipment.status)}</span>
                                                <span className="capitalize">{getStatusDisplay(shipment.status)}</span>
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Customer</p>
                                                <p className="text-sm font-medium">{shipment.order?.customerName}</p>
                                                <p className="text-xs text-gray-500">Order: {shipment.order?.orderNumber}</p>
                                            </div>
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-500">Carrier</p>
                                                    <p className="text-sm capitalize">{shipment.carrier?.replace("_", " ")}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Created</p>
                                                    <div className="flex items-center gap-1">
                                                        <FaCalendar className="text-gray-400 text-xs" />
                                                        <p className="text-xs">{new Date(shipment.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-2 border-t dark:border-slate-700">
                                            <button
                                                onClick={() => {
                                                    setSelectedShipment(shipment);
                                                    setOpenDetailsModal(true);
                                                }}
                                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedShipment(shipment);
                                                    setOpenStatusModal(true);
                                                }}
                                                className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                                            >
                                                <FaTruck />
                                            </button>
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
                                            <th className="p-4 text-left text-sm font-semibold">Shipment #</th>
                                            <th className="p-4 text-left text-sm font-semibold">Tracking #</th>
                                            <th className="p-4 text-left text-sm font-semibold">Customer</th>
                                            <th className="p-4 text-left text-sm font-semibold">Carrier</th>
                                            <th className="p-4 text-left text-sm font-semibold">Status</th>
                                            <th className="p-4 text-left text-sm font-semibold">Created</th>
                                            <th className="p-4 text-center text-sm font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-10">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                                                </td>
                                            </tr>
                                        ) : paginatedShipments.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-10 text-gray-500">
                                                    No shipments found
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedShipments.map((shipment) => (
                                                <tr key={shipment._id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                                                    <td className="p-4">
                                                        <p className="font-mono font-semibold text-sm">{shipment.shipmentNumber}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="font-mono text-sm">{shipment.trackingNumber || "-"}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="font-medium">{shipment.order?.customerName}</p>
                                                        <p className="text-xs text-gray-500">Order: {shipment.order?.orderNumber}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="capitalize text-sm">{shipment.carrier?.replace("_", " ")}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                                                            <span>{getStatusIcon(shipment.status)}</span>
                                                            <span className="capitalize">{getStatusDisplay(shipment.status)}</span>
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500">
                                                        {new Date(shipment.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedShipment(shipment);
                                                                    setOpenDetailsModal(true);
                                                                }}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                                title="View Details"
                                                            >
                                                                <FaEye />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedShipment(shipment);
                                                                    setOpenStatusModal(true);
                                                                }}
                                                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                                                                title="Update Status"
                                                            >
                                                                <FaTruck />
                                                            </button>
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
                    {filteredShipments.length > 0 && totalPages > 1 && (
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
                </div>
            </div>

            {/* Modals */}
            <CreateShipmentModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                refresh={fetchShipments}
            />

            <ShipmentDetailsModal
                open={openDetailsModal}
                onClose={() => setOpenDetailsModal(false)}
                shipment={selectedShipment}
            />

            <UpdateStatusModal
                open={openStatusModal}
                onClose={() => setOpenStatusModal(false)}
                shipment={selectedShipment}
                onUpdate={handleUpdateStatus}
            />
        </DashboardLayout>
    );
}

export default Shipments;