
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import { FaBox, FaEye, FaTruck, FaClock, FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import OrderDetailsModal from "../../components/orders/OrderDetailsModal";

function WorkerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const fetchMyOrders = async () => {
        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem("user") || "{}");

            console.log("Fetching orders for worker:", userData._id);

            const res = await api.get(`/orders/worker/${userData._id}`);
            setOrders(res.data.data || []);

            console.log("Orders found:", res.data.data?.length);

        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch your orders");
        } finally {
            setLoading(false);
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        My Orders
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Orders you are working on
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                        <p className="text-gray-500 text-sm">Total Orders</p>
                        <h2 className="text-2xl font-bold text-blue-600">{orders.length}</h2>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                        <p className="text-gray-500 text-sm">In Progress</p>
                        <h2 className="text-2xl font-bold text-green-600">
                            {orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length}
                        </h2>
                    </div>
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-12 text-center">
                        <FaBox className="text-5xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No orders assigned to you</p>
                        <p className="text-sm text-gray-400 mt-1">
                            When orders are assigned, they will appear here
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white dark:bg-slate-800 rounded-2xl border p-5 shadow-sm hover:shadow-md transition cursor-pointer"
                                onClick={() => {
                                    setSelectedOrder(order);
                                    setOpenDetailsModal(true);
                                }}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-mono font-bold text-lg">{order.orderNumber}</p>
                                        <p className="text-gray-600">{order.customerName}</p>
                                    </div>
                                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        <span>{getStatusIcon(order.status)}</span>
                                        <span className="capitalize">{order.status}</span>
                                    </span>
                                </div>

                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-500">Items:</span>
                                        <span className="font-medium">{order.items?.length || 0} SKUs</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Total Quantity:</span>
                                        <span className="font-medium">
                                            {order.items?.reduce((sum, i) => sum + i.qty, 0)} units
                                        </span>
                                    </div>
                                </div>

                                {/* Progress indicator for picking */}
                                {order.status === "picking" && (
                                    <div className="mt-3 pt-3 border-t">
                                        <div className="flex items-center gap-2 text-xs text-amber-600">
                                            <FaClock />
                                            <span>Picking in progress...</span>
                                        </div>
                                    </div>
                                )}

                                {order.status === "shipped" && (
                                    <div className="mt-3 pt-3 border-t">
                                        <div className="flex items-center gap-2 text-xs text-green-600">
                                            <FaTruck />
                                            <span>Order shipped! Track in Shipments page.</span>
                                        </div>
                                    </div>
                                )}

                                {order.status === "delivered" && (
                                    <div className="mt-3 pt-3 border-t">
                                        <div className="flex items-center gap-2 text-xs text-emerald-600">
                                            <FaCheckCircle />
                                            <span>Order delivered successfully! ✅</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
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