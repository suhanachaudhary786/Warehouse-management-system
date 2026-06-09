
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import {
    FaBox,
    FaEye,
    FaTruck,
    FaClock,
    FaCheckCircle,
    FaSearch,
    FaFilter,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaShoppingCart,
    FaUser,
    FaCalendar,
    FaBoxOpen,
} from "react-icons/fa";
import toast from "react-hot-toast";
import OrderDetailsModal from "../../components/orders/OrderDetailsModal";

function WorkerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    useEffect(() => {
        fetchMyOrders();
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

    const fetchMyOrders = async () => {
        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            const res = await api.get(`/orders/worker/${userData._id}`);
            setOrders(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch your orders");
        } finally {
            setLoading(false);
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

    const getStatusIcon = (status) => {
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

    const getStatusProgress = (status) => {
        const progress = {
            created: 0,
            allocated: 20,
            picking: 40,
            packed: 60,
            shipped: 80,
            delivered: 100,
            cancelled: 100,
        };
        return progress[status] || 0;
    };

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch = searchTerm === "" ||
            order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter ? order.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const stats = {
        total: orders.length,
        inProgress: orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length,
        completed: orders.filter(o => o.status === "delivered").length,
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
                            My Orders
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                            Orders you are working on
                        </p>
                    </div>

                    {/* Stats Cards - Responsive Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 md:mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</h2>
                                </div>
                                <FaShoppingCart className="text-blue-500 text-2xl sm:text-3xl" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.inProgress}</h2>
                                </div>
                                <FaClock className="text-purple-500 text-2xl sm:text-3xl" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</h2>
                                </div>
                                <FaCheckCircle className="text-green-500 text-2xl sm:text-3xl" />
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter - Responsive */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="text"
                                placeholder="Search by order number or customer..."
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
                                <option value="created">Created</option>
                                <option value="allocated">Allocated</option>
                                <option value="picking">Picking</option>
                                <option value="packed">Packed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
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
                                    <h3 className="font-semibold text-lg">Filter Orders</h3>
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
                                        <option value="allocated">Allocated</option>
                                        <option value="picking">Picking</option>
                                        <option value="packed">Packed</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Orders List */}
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-8 sm:p-12 text-center">
                            <FaBox className="text-4xl sm:text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No orders assigned to you</p>
                            <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                                {searchTerm || statusFilter ? "Try changing your search or filter" : "When orders are assigned, they will appear here"}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 sm:space-y-4">
                                {paginatedOrders.map((order) => (
                                    <div
                                        key={order._id}
                                        className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-4 sm:p-5 shadow-sm hover:shadow-md transition cursor-pointer"
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setOpenDetailsModal(true);
                                        }}
                                    >
                                        {/* Header */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                                            <div>
                                                <p className="font-mono font-bold text-base sm:text-lg text-gray-800 dark:text-white">
                                                    {order.orderNumber}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <FaUser className="text-gray-400 text-xs" />
                                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                        {order.customerName}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                <span>{getStatusIcon(order.status)}</span>
                                                <span className="capitalize">{order.status}</span>
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-3 mb-3">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>Order Progress</span>
                                                <span>{getStatusProgress(order.status)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                                                <div
                                                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${getStatusProgress(order.status)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Order Details Grid */}
                                        <div className="border-t dark:border-slate-700 pt-3">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
                                                    <p className="font-medium text-gray-800 dark:text-white">
                                                        {order.items?.length || 0} SKUs
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Quantity</p>
                                                    <p className="font-medium text-gray-800 dark:text-white">
                                                        {order.items?.reduce((sum, i) => sum + i.qty, 0)} units
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Created Date</p>
                                                    <div className="flex items-center gap-1">
                                                        <FaCalendar className="text-gray-400 text-xs" />
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                                                    <div className="flex items-center gap-1">
                                                        <FaClock className="text-gray-400 text-xs" />
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                            {new Date(order.updatedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status-specific Messages */}
                                        {order.status === "picking" && (
                                            <div className="mt-3 pt-3 border-t dark:border-slate-700">
                                                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                                    <FaClock className="text-sm" />
                                                    <span>Picking in progress...</span>
                                                </div>
                                            </div>
                                        )}

                                        {order.status === "shipped" && (
                                            <div className="mt-3 pt-3 border-t dark:border-slate-700">
                                                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                                    <FaTruck className="text-sm" />
                                                    <span>Order shipped! Track in Shipments page.</span>
                                                </div>
                                            </div>
                                        )}

                                        {order.status === "delivered" && (
                                            <div className="mt-3 pt-3 border-t dark:border-slate-700">
                                                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                                                    <FaCheckCircle className="text-sm" />
                                                    <span>Order delivered successfully!</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* View Details Link */}
                                        <div className="mt-3 pt-2 text-right">
                                            <span className="text-amber-500 text-xs sm:text-sm flex items-center justify-end gap-1">
                                                View Details <FaEye className="text-xs" />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
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
                        </>
                    )}

                    {/* Refresh Button */}
                    <div className="mt-6 sm:mt-8 text-center">
                        <button
                            onClick={fetchMyOrders}
                            className="text-amber-500 hover:text-amber-600 flex items-center gap-2 mx-auto text-sm sm:text-base"
                        >
                            <FaBox />
                            Refresh Orders
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            <OrderDetailsModal
                open={openDetailsModal}
                onClose={() => {
                    setOpenDetailsModal(false);
                    setSelectedOrder(null);
                }}
                order={selectedOrder}
            />
        </DashboardLayout>
    );
}

export default WorkerOrders;