
// pages/Orders.jsx
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
} from "react-icons/fa";
import toast from "react-hot-toast";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");

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
    }, []);

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
            created: "bg-gray-100 text-gray-600",
            allocated: "bg-blue-100 text-blue-600",
            picking: "bg-purple-100 text-purple-600",
            packed: "bg-yellow-100 text-yellow-600",
            shipped: "bg-green-100 text-green-600",
            delivered: "bg-emerald-100 text-emerald-600",
            cancelled: "bg-red-100 text-red-600",
        };
        return colors[status] || "bg-gray-100 text-gray-600";
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: "bg-red-100 text-red-600",
            medium: "bg-yellow-100 text-yellow-600",
            low: "bg-green-100 text-green-600",
        };
        return colors[priority] || "bg-gray-100 text-gray-600";
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

    // Filter orders
    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
            order.customerName?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter ? order.status === statusFilter : true;
        const matchesPriority = priorityFilter ? order.priority === priorityFilter : true;
        return matchesSearch && matchesStatus && matchesPriority;
    });

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

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                <div className="p-4 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                                Orders
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                Manage customer orders and track shipments
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedOrder(null);
                                setOpenModal(true);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition shadow-md hover:shadow-lg"
                        >
                            <FaPlus /> Create Order
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-3 text-center">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-xl font-bold">{stats.total}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-3 text-center">
                            <p className="text-xs text-gray-500">Created</p>
                            <p className="text-xl font-bold text-gray-600">{stats.created}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-3 text-center">
                            <p className="text-xs text-gray-500">Allocated</p>
                            <p className="text-xl font-bold text-blue-600">{stats.allocated}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-3 text-center">
                            <p className="text-xs text-gray-500">Picking</p>
                            <p className="text-xl font-bold text-purple-600">{stats.picking}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-3 text-center">
                            <p className="text-xs text-gray-500">Packed</p>
                            <p className="text-xl font-bold text-yellow-600">{stats.packed}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-3 text-center">
                            <p className="text-xs text-gray-500">Shipped</p>
                            <p className="text-xl font-bold text-green-600">{stats.shipped}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-3 text-center">
                            <p className="text-xs text-gray-500">Delivered</p>
                            <p className="text-xl font-bold text-emerald-600">{stats.delivered}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border p-3 text-center">
                            <p className="text-xs text-gray-500">Cancelled</p>
                            <p className="text-xl font-bold text-red-600">{stats.cancelled}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by order number or customer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 border rounded-xl py-3 focus:ring-2 focus:ring-amber-500 dark:bg-slate-800"
                            />
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 dark:bg-slate-800"
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
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 dark:bg-slate-800"
                            >
                                <option value="">All Priority</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Orders Table */}
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
                                    ) : filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-10 text-gray-500">
                                                No orders found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => (
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
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
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