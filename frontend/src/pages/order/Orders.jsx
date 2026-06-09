
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import OrderFormModal from "../../components/orders/OrderFormModal";
import OrderDetailsModal from "../../components/orders/OrderDetailsModal";
import UpdateStatusModal from "../../components/orders/UpdateStatusModal";
import {
    FaPlus,
    FaEye,
    FaEdit,
    FaTrash,
    FaTruck,
    FaBoxOpen,
    FaSearch,
    FaFilter,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaSortAmountDown,
} from "react-icons/fa";
import toast from "react-hot-toast";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");

    const [openModal, setOpenModal] = useState(false);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get("/orders");
            setOrders(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
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

    const handleDelete = async (order) => {
        if (!window.confirm(`Delete order ${order.orderNumber}?`)) return;

        try {
            await api.delete(`/orders/${order._id}`);
            toast.success("Order deleted successfully");
            fetchOrders();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to delete order");
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}`, { status: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            created: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
            allocated: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            picking: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
            packed: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
            shipped: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            delivered: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
            cancelled: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        };
        return colors[status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
            medium: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
            low: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        };
        return colors[priority] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    const getStatusBadge = (status) => {
        const icons = {
            created: "📝",
            allocated: "📋",
            picking: "🤔",
            packed: "📦",
            shipped: "🚚",
            delivered: "✅",
            cancelled: "❌",
        };
        return icons[status] || "📋";
    };

    // Sort and filter orders
    const filteredOrders = orders
        .filter((order) => {
            const matchesSearch =
                order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
                order.customerName?.toLowerCase().includes(search.toLowerCase()) ||
                order.customerEmail?.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter ? order.status === statusFilter : true;
            const matchesPriority = priorityFilter ? order.priority === priorityFilter : true;
            return matchesSearch && matchesStatus && matchesPriority;
        })
        .sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === "createdAt" || sortBy === "updatedAt") {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }

            if (sortBy === "items") {
                aVal = a.items?.length || 0;
                bVal = b.items?.length || 0;
            }

            if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
            if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Stats
    const stats = {
        total: orders.length,
        created: orders.filter(o => o.status === "created").length,
        allocated: orders.filter(o => o.status === "allocated").length,
        picking: orders.filter(o => o.status === "picking").length,
        packed: orders.filter(o => o.status === "packed").length,
        shipped: orders.filter(o => o.status === "shipped").length,
        delivered: orders.filter(o => o.status === "delivered").length,
        cancelled: orders.filter(o => o.status === "cancelled").length,
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                    {/* Header - Responsive */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                                Orders
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                                Manage customer orders and track shipments
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedOrder(null);
                                setOpenModal(true);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl flex items-center gap-2 transition shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
                        >
                            <FaPlus className="text-sm sm:text-base" />
                            <span>Create Order</span>
                        </button>
                    </div>

                    {/* Stats Cards - Responsive Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 mb-6 md:mb-8">
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-2 sm:p-3 text-center">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-lg sm:text-xl font-bold">{stats.total}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-2 sm:p-3 text-center">
                            <p className="text-xs text-gray-500">Created</p>
                            <p className="text-lg sm:text-xl font-bold text-gray-600">{stats.created}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-2 sm:p-3 text-center">
                            <p className="text-xs text-gray-500">Allocated</p>
                            <p className="text-lg sm:text-xl font-bold text-blue-600">{stats.allocated}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-2 sm:p-3 text-center">
                            <p className="text-xs text-gray-500">Picking</p>
                            <p className="text-lg sm:text-xl font-bold text-purple-600">{stats.picking}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-2 sm:p-3 text-center">
                            <p className="text-xs text-gray-500">Packed</p>
                            <p className="text-lg sm:text-xl font-bold text-yellow-600">{stats.packed}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-2 sm:p-3 text-center">
                            <p className="text-xs text-gray-500">Shipped</p>
                            <p className="text-lg sm:text-xl font-bold text-green-600">{stats.shipped}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-2 sm:p-3 text-center">
                            <p className="text-xs text-gray-500">Delivered</p>
                            <p className="text-lg sm:text-xl font-bold text-emerald-600">{stats.delivered}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-2 sm:p-3 text-center">
                            <p className="text-xs text-gray-500">Cancelled</p>
                            <p className="text-lg sm:text-xl font-bold text-red-600">{stats.cancelled}</p>
                        </div>
                    </div>

                    {/* Filters - Responsive */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="text"
                                placeholder="Search by order number or customer..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 border rounded-xl py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:border-slate-700"
                            />
                        </div>

                        {/* Desktop Filters */}
                        <div className="hidden sm:flex gap-3">
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
                                <option value="allocated">Allocated</option>
                                <option value="picking">Picking</option>
                                <option value="packed">Packed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <select
                                value={priorityFilter}
                                onChange={(e) => {
                                    setPriorityFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:border-slate-700"
                            >
                                <option value="">All Priority</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                            <button
                                onClick={() => handleSort("createdAt")}
                                className="border rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                            >
                                <FaSortAmountDown />
                                <span className="text-sm">Date</span>
                            </button>
                        </div>

                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="sm:hidden flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-800 border rounded-xl px-4 py-2"
                        >
                            <FaFilter />
                            <span>Filters</span>
                            {(statusFilter || priorityFilter) && (
                                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {(statusFilter ? 1 : 0) + (priorityFilter ? 1 : 0)}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Mobile Filter Modal */}
                    {showMobileFilters && isMobile && (
                        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm">
                                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                                    <h3 className="font-semibold text-lg">Filter Orders</h3>
                                    <button onClick={() => setShowMobileFilters(false)} className="p-1">
                                        <FaTimes />
                                    </button>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="w-full border rounded-xl px-4 py-3 dark:bg-slate-700 dark:border-slate-600"
                                        >
                                            <option value="">All Status</option>
                                            <option value="created">Created</option>
                                            <option value="allocated">Allocated</option>
                                            <option value="picking">Picking</option>
                                            <option value="packed">Packed</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Priority</label>
                                        <select
                                            value={priorityFilter}
                                            onChange={(e) => setPriorityFilter(e.target.value)}
                                            className="w-full border rounded-xl px-4 py-3 dark:bg-slate-700 dark:border-slate-600"
                                        >
                                            <option value="">All Priority</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowMobileFilters(false);
                                            setCurrentPage(1);
                                        }}
                                        className="w-full bg-amber-500 text-white py-3 rounded-xl"
                                    >
                                        Apply Filters
                                    </button>
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
                            ) : paginatedOrders.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    No orders found
                                </div>
                            ) : (
                                paginatedOrders.map((order) => (
                                    <div key={order._id} className="bg-white dark:bg-slate-800 rounded-xl border p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-mono font-semibold text-sm">{order.orderNumber}</p>
                                                <p className="font-medium text-sm mt-1">{order.customerName}</p>
                                                <p className="text-xs text-gray-500">{order.customerEmail}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)} capitalize`}>
                                                {order.priority}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Items</p>
                                                <p className="text-sm font-semibold">{order.items?.length || 0} items</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Total Qty</p>
                                                <p className="text-sm font-semibold">{order.items?.reduce((sum, i) => sum + i.qty, 0)} units</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Created</p>
                                                <p className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-2 border-t dark:border-slate-700">
                                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                <span>{getStatusBadge(order.status)}</span>
                                                <span className="capitalize">{order.status}</span>
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setOpenDetailsModal(true);
                                                    }}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setOpenStatusModal(true);
                                                    }}
                                                    className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                                                >
                                                    <FaEdit />
                                                </button>
                                                {order.status !== "shipped" && order.status !== "delivered" && (
                                                    <button
                                                        onClick={() => handleDelete(order)}
                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                )}
                                            </div>
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
                                        <tr>
                                            <th className="p-4 text-left text-sm font-semibold">Order #</th>
                                            <th className="p-4 text-left text-sm font-semibold">Customer</th>
                                            <th className="p-4 text-left text-sm font-semibold">Items</th>
                                            <th className="p-4 text-left text-sm font-semibold">Priority</th>
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
                                        ) : paginatedOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-10 text-gray-500">
                                                    No orders found
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedOrders.map((order) => (
                                                <tr key={order._id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                                                    <td className="p-4">
                                                        <p className="font-mono font-semibold text-sm">{order.orderNumber}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="font-medium">{order.customerName}</p>
                                                        <p className="text-xs text-gray-500">{order.customerEmail}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="text-sm">{order.items?.length || 0} items</p>
                                                        <p className="text-xs text-gray-500">
                                                            Total: {order.items?.reduce((sum, i) => sum + i.qty, 0)} units
                                                        </p>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)} capitalize`}>
                                                            {order.priority}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(order.status)}`}>
                                                            <span>{getStatusBadge(order.status)}</span>
                                                            <span className="capitalize">{order.status}</span>
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setOpenDetailsModal(true);
                                                                }}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                                title="View Details"
                                                            >
                                                                <FaEye />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedOrder(order);
                                                                    setOpenStatusModal(true);
                                                                }}
                                                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                                                                title="Update Status"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            {order.status !== "shipped" && order.status !== "delivered" && (
                                                                <button
                                                                    onClick={() => handleDelete(order)}
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
                    {filteredOrders.length > 0 && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t dark:border-slate-700">
                            <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                                Showing {paginatedOrders.length} of {filteredOrders.length} orders
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
            <OrderFormModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                selectedOrder={selectedOrder}
                refresh={fetchOrders}
            />

            <OrderDetailsModal
                open={openDetailsModal}
                onClose={() => setOpenDetailsModal(false)}
                order={selectedOrder}
            />

            <UpdateStatusModal
                open={openStatusModal}
                onClose={() => setOpenStatusModal(false)}
                order={selectedOrder}
                onUpdate={handleUpdateStatus}
            />
        </DashboardLayout>
    );
}

export default Orders;