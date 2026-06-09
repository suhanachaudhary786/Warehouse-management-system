
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import CreateReturnModal from "../../components/returns/CreateReturnModal";
import ReturnDetailsModal from "../../components/returns/ReturnDetailsModal";
import {
    FaPlus,
    FaEye,
    FaCheckCircle,
    FaTrash,
    FaBan,
    FaSearch,
    FaBoxOpen,
    FaFilter,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaCalendar,
    FaUser,
} from "react-icons/fa";
import toast from "react-hot-toast";

function Returns() {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const res = await api.get("/returns/all");
            setReturns(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch returns");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
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

    const handleRestock = async (id) => {
        if (!window.confirm("Restock this item back to inventory?")) return;

        try {
            await api.put(`/returns/restock/${id}`);
            toast.success("Item restocked successfully");
            fetchReturns();
        } catch (error) {
            console.error(error);
            toast.error("Failed to restock item");
        }
    };

    const handleDamage = async (id) => {
        if (!window.confirm("Mark this return as damaged?")) return;

        try {
            await api.put(`/returns/damage/${id}`);
            toast.success("Item marked as damaged");
            fetchReturns();
        } catch (error) {
            console.error(error);
            toast.error("Failed to mark as damaged");
        }
    };

    const handleQuarantine = async (id) => {
        if (!window.confirm("Move this item to quarantine?")) return;

        try {
            await api.put(`/returns/quarantine/${id}`);
            toast.success("Item moved to quarantine");
            fetchReturns();
        } catch (error) {
            console.error(error);
            toast.error("Failed to quarantine item");
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
            inspected: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            restocked: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            damaged: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
            quarantined: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
        };
        return colors[status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: "⏳",
            inspected: "🔍",
            restocked: "✅",
            damaged: "❌",
            quarantined: "⚠️",
        };
        return icons[status] || "📋";
    };

    const getStatusDisplay = (status) => {
        return status?.charAt(0).toUpperCase() + status?.slice(1) || status;
    };

    // Filter returns
    const filteredReturns = returns.filter((returnItem) => {
        const matchesSearch =
            returnItem.order?.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
            returnItem.sku?.skuCode?.toLowerCase().includes(search.toLowerCase()) ||
            returnItem.sku?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter ? returnItem.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
    const paginatedReturns = filteredReturns.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const stats = {
        total: returns.length,
        pending: returns.filter(r => r.status === "pending").length,
        restocked: returns.filter(r => r.status === "restocked").length,
        damaged: returns.filter(r => r.status === "damaged").length,
        quarantined: returns.filter(r => r.status === "quarantined").length,
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                    {/* Header - Responsive */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                                Returns Management
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                                Process customer returns and manage reverse logistics
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedReturn(null);
                                setOpenModal(true);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl flex items-center gap-2 transition shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
                        >
                            <FaPlus className="text-sm sm:text-base" />
                            <span>Create Return</span>
                        </button>
                    </div>

                    {/* Stats Cards - Responsive Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6 md:mb-8">
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Returns</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</h2>
                                </div>
                                <FaBoxOpen className="text-amber-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</h2>
                                </div>
                                <span className="text-xl">⏳</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Restocked</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-green-600">{stats.restocked}</h2>
                                </div>
                                <FaCheckCircle className="text-green-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Damaged</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-red-600">{stats.damaged}</h2>
                                </div>
                                <FaTrash className="text-red-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Quarantined</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-purple-600">{stats.quarantined}</h2>
                                </div>
                                <FaBan className="text-purple-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters - Responsive */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="text"
                                placeholder="Search by order #, SKU code, or product name..."
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
                                <option value="inspected">Inspected</option>
                                <option value="restocked">Restocked</option>
                                <option value="damaged">Damaged</option>
                                <option value="quarantined">Quarantined</option>
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
                                    <h3 className="font-semibold text-lg">Filter Returns</h3>
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
                                        <option value="inspected">Inspected</option>
                                        <option value="restocked">Restocked</option>
                                        <option value="damaged">Damaged</option>
                                        <option value="quarantined">Quarantined</option>
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
                            ) : paginatedReturns.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    No returns found
                                </div>
                            ) : (
                                paginatedReturns.map((returnItem) => (
                                    <div key={returnItem._id} className="bg-white dark:bg-slate-800 rounded-xl border p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-mono font-semibold text-sm">{returnItem.order?.orderNumber}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <FaBoxOpen className="text-amber-500 text-xs" />
                                                    <p className="text-sm font-medium">{returnItem.sku?.name}</p>
                                                </div>
                                                <p className="text-xs text-gray-500 font-mono mt-1">{returnItem.sku?.skuCode}</p>
                                            </div>
                                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                                                <span>{getStatusIcon(returnItem.status)}</span>
                                                <span className="capitalize">{returnItem.status}</span>
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-3 pt-2 border-t dark:border-slate-700">
                                            <div>
                                                <p className="text-xs text-gray-500">Quantity</p>
                                                <p className="text-sm font-semibold">{returnItem.qty} units</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Return Date</p>
                                                <div className="flex items-center gap-1">
                                                    <FaCalendar className="text-gray-400 text-xs" />
                                                    <p className="text-xs">{new Date(returnItem.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-xs text-gray-500">Reason</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                    {returnItem.reason || "-"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-2 border-t dark:border-slate-700">
                                            <button
                                                onClick={() => {
                                                    setSelectedReturn(returnItem);
                                                    setOpenDetailsModal(true);
                                                }}
                                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                            >
                                                <FaEye />
                                            </button>

                                            {returnItem.status === "pending" && (
                                                <>
                                                    <button
                                                        onClick={() => handleRestock(returnItem._id)}
                                                        className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                                                        title="Restock"
                                                    >
                                                        <FaCheckCircle />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDamage(returnItem._id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                        title="Mark Damaged"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                    <button
                                                        onClick={() => handleQuarantine(returnItem._id)}
                                                        className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
                                                        title="Quarantine"
                                                    >
                                                        <FaBan />
                                                    </button>
                                                </>
                                            )}
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
                                            <th className="p-4 text-left text-sm font-semibold">Order #</th>
                                            <th className="p-4 text-left text-sm font-semibold">Product</th>
                                            <th className="p-4 text-left text-sm font-semibold">SKU</th>
                                            <th className="p-4 text-center text-sm font-semibold">Qty</th>
                                            <th className="p-4 text-left text-sm font-semibold">Reason</th>
                                            <th className="p-4 text-left text-sm font-semibold">Status</th>
                                            <th className="p-4 text-left text-sm font-semibold">Return Date</th>
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
                                        ) : paginatedReturns.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="text-center py-10 text-gray-500">
                                                    No returns found
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedReturns.map((returnItem) => (
                                                <tr key={returnItem._id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                                                    <td className="p-4">
                                                        <p className="font-mono font-semibold text-sm">{returnItem.order?.orderNumber}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <FaBoxOpen className="text-amber-500" />
                                                            <span className="text-sm">{returnItem.sku?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="font-mono text-sm">{returnItem.sku?.skuCode}</p>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="font-semibold text-sm">{returnItem.qty}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-sm max-w-xs truncate" title={returnItem.reason}>
                                                            {returnItem.reason || "-"}
                                                        </p>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                                                            <span>{getStatusIcon(returnItem.status)}</span>
                                                            <span className="capitalize">{returnItem.status}</span>
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500">
                                                        {new Date(returnItem.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedReturn(returnItem);
                                                                    setOpenDetailsModal(true);
                                                                }}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                                title="View Details"
                                                            >
                                                                <FaEye />
                                                            </button>

                                                            {returnItem.status === "pending" && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleRestock(returnItem._id)}
                                                                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                                                                        title="Restock"
                                                                    >
                                                                        <FaCheckCircle />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDamage(returnItem._id)}
                                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                                        title="Mark Damaged"
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleQuarantine(returnItem._id)}
                                                                        className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition"
                                                                        title="Quarantine"
                                                                    >
                                                                        <FaBan />
                                                                    </button>
                                                                </>
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
                    {filteredReturns.length > 0 && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t dark:border-slate-700">
                            <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                                Showing {paginatedReturns.length} of {filteredReturns.length} returns
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
            <CreateReturnModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                refresh={fetchReturns}
            />

            <ReturnDetailsModal
                open={openDetailsModal}
                onClose={() => setOpenDetailsModal(false)}
                returnItem={selectedReturn}
                onRestock={handleRestock}
                onDamage={handleDamage}
                onQuarantine={handleQuarantine}
            />
        </DashboardLayout>
    );
}

export default Returns;