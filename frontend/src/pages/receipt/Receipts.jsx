
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import CreateReceiptModal from "../../components/receipts/CreateReceiptModal";
import { FaPlus, FaEye, FaTrash, FaSearch, FaFilter, FaTimes, FaChevronLeft, FaChevronRight, FaBoxes, FaTruck, FaCalendar, FaUser } from "react-icons/fa";
import toast from "react-hot-toast";
import ReceiptViewModal from "../../components/receipts/ReceiptViewModal";

function Receipts() {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchReceipts();
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

    const fetchReceipts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/receipts");
            setReceipts(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch receipts");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this receipt?")) return;
        try {
            await api.delete(`/receipts/${id}`);
            toast.success("Receipt deleted");
            fetchReceipts();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete");
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            created: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
            receiving: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            putaway: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
            closed: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        };
        return colors[status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    const getStatusIcon = (status) => {
        const icons = {
            created: "📝",
            receiving: "📥",
            putaway: "📦",
            closed: "✅",
        };
        return icons[status] || "📋";
    };

    // Filter receipts
    const filteredReceipts = receipts.filter((receipt) => {
        const matchesSearch =
            receipt.receiptNumber?.toLowerCase().includes(search.toLowerCase()) ||
            receipt.supplier?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter ? receipt.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
    const paginatedReceipts = filteredReceipts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Stats
    const stats = {
        total: receipts.length,
        created: receipts.filter(r => r.status === "created").length,
        receiving: receipts.filter(r => r.status === "receiving").length,
        putaway: receipts.filter(r => r.status === "putaway").length,
        closed: receipts.filter(r => r.status === "closed").length,
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                    {/* Header - Responsive */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                                Receipts (ASN)
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                                Manage incoming shipments and advance shipping notices
                            </p>
                        </div>
                        <button
                            onClick={() => setOpenModal(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl flex items-center gap-2 transition shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
                        >
                            <FaPlus className="text-sm sm:text-base" />
                            <span>Create Receipt</span>
                        </button>
                    </div>

                    {/* Stats Cards - Responsive Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Receipts</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</h2>
                                </div>
                                <FaBoxes className="text-amber-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-600">{stats.created}</h2>
                                </div>
                                <span className="text-xl">📝</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-blue-600">{stats.receiving + stats.putaway}</h2>
                                </div>
                                <FaTruck className="text-blue-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-green-600">{stats.closed}</h2>
                                </div>
                                <span className="text-xl">✅</span>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters - Responsive */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="text"
                                placeholder="Search by receipt number or supplier..."
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
                                <option value="created">Created</option>
                                <option value="receiving">Receiving</option>
                                <option value="putaway">Putaway</option>
                                <option value="closed">Closed</option>
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
                                    <h3 className="font-semibold text-lg">Filter Receipts</h3>
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
                                        <option value="created">Created</option>
                                        <option value="receiving">Receiving</option>
                                        <option value="putaway">Putaway</option>
                                        <option value="closed">Closed</option>
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
                            ) : paginatedReceipts.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    No receipts found
                                </div>
                            ) : (
                                paginatedReceipts.map((receipt) => (
                                    <div key={receipt._id} className="bg-white dark:bg-slate-800 rounded-xl border p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-mono font-semibold text-sm">{receipt.receiptNumber}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <FaUser className="text-gray-400 text-xs" />
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{receipt.supplier}</p>
                                                </div>
                                            </div>
                                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                                                <span>{getStatusIcon(receipt.status)}</span>
                                                <span className="capitalize">{receipt.status}</span>
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-3 pt-2 border-t dark:border-slate-700">
                                            <div>
                                                <p className="text-xs text-gray-500">SKUs</p>
                                                <p className="text-sm font-semibold">{receipt.items.length} items</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Created</p>
                                                <div className="flex items-center gap-1">
                                                    <FaCalendar className="text-gray-400 text-xs" />
                                                    <p className="text-xs">{new Date(receipt.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-2 border-t dark:border-slate-700">
                                            <button
                                                onClick={() => {
                                                    setSelectedReceipt(receipt);
                                                    setViewOpen(true);
                                                }}
                                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                            >
                                                <FaEye />
                                            </button>
                                            {receipt.status === "created" && (
                                                <button
                                                    onClick={() => handleDelete(receipt._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                >
                                                    <FaTrash />
                                                </button>
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
                                            <th className="p-4 text-left text-sm font-semibold">Receipt #</th>
                                            <th className="p-4 text-left text-sm font-semibold">Supplier</th>
                                            <th className="p-4 text-left text-sm font-semibold">Items</th>
                                            <th className="p-4 text-left text-sm font-semibold">Status</th>
                                            <th className="p-4 text-left text-sm font-semibold">Created</th>
                                            <th className="p-4 text-center text-sm font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-10">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                                                </td>
                                            </tr>
                                        ) : paginatedReceipts.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-10 text-gray-500">
                                                    No receipts found
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedReceipts.map((receipt) => (
                                                <tr key={receipt._id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                                                    <td className="p-4">
                                                        <p className="font-mono font-semibold text-sm">{receipt.receiptNumber}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="font-medium">{receipt.supplier}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-sm">{receipt.items.length} SKUs</p>
                                                        <p className="text-xs text-gray-500">
                                                            Total: {receipt.items.reduce((sum, i) => sum + i.expectedQty, 0)} units
                                                        </p>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                                                            <span>{getStatusIcon(receipt.status)}</span>
                                                            <span className="capitalize">{receipt.status}</span>
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500">
                                                        {new Date(receipt.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center gap-3">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedReceipt(receipt);
                                                                    setViewOpen(true);
                                                                }}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                                title="View Details"
                                                            >
                                                                <FaEye />
                                                            </button>
                                                            {receipt.status === "created" && (
                                                                <button
                                                                    onClick={() => handleDelete(receipt._id)}
                                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                                    title="Delete"
                                                                >
                                                                    <FaTrash />
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
                    {filteredReceipts.length > 0 && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t dark:border-slate-700">
                            <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                                Showing {paginatedReceipts.length} of {filteredReceipts.length} receipts
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
            <CreateReceiptModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                refresh={fetchReceipts}
            />
            <ReceiptViewModal
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                receipt={selectedReceipt}
                refresh={fetchReceipts}
            />
        </DashboardLayout>
    );
}

export default Receipts;