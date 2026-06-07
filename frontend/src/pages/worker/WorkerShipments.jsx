

// src/pages/worker/WorkerShipments.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import { FaTruck, FaBox, FaCheckCircle, FaClock } from "react-icons/fa";
import toast from "react-hot-toast";

function WorkerShipments() {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyShipments();
    }, []);

    const fetchMyShipments = async () => {
        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem("user") || "{}");

            // Fetch shipments related to worker's orders
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
            in_transit: "🚚",
            out_for_delivery: "🚛",
            delivered: "✅",
            failed: "❌",
        };
        return icons[status] || "📦";
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-gray-100 text-gray-600",
            label_generated: "bg-blue-100 text-blue-600",
            in_transit: "bg-yellow-100 text-yellow-600",
            out_for_delivery: "bg-orange-100 text-orange-600",
            delivered: "bg-green-100 text-green-600",
            failed: "bg-red-100 text-red-600",
        };
        return colors[status] || "bg-gray-100 text-gray-600";
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
                    <h1 className="text-3xl font-bold">My Shipments</h1>
                    <p className="text-gray-500 mt-2">Track your orders</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <p className="text-gray-500 text-sm">Total Shipments</p>
                        <h2 className="text-2xl font-bold">{shipments.length}</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <p className="text-gray-500 text-sm">In Transit</p>
                        <h2 className="text-2xl font-bold text-yellow-600">
                            {shipments.filter(s => s.status === "in_transit").length}
                        </h2>
                    </div>
                </div>

                {/* Shipments List */}
                {shipments.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-12 text-center">
                        <FaTruck className="text-5xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No shipments found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {shipments.map((shipment) => (
                            <div key={shipment._id} className="bg-white dark:bg-slate-800 rounded-2xl border p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-mono font-bold">{shipment.trackingNumber}</p>
                                        <p className="text-sm text-gray-500">Order: {shipment.order?.orderNumber}</p>
                                    </div>
                                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                                        <span>{getStatusIcon(shipment.status)}</span>
                                        <span className="capitalize">{shipment.status?.replace("_", " ")}</span>
                                    </span>
                                </div>

                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Carrier:</span>
                                        <span className="capitalize">{shipment.carrier}</span>
                                    </div>
                                    {shipment.estimatedDelivery && (
                                        <div className="flex justify-between text-sm mt-1">
                                            <span className="text-gray-500">Est. Delivery:</span>
                                            <span>{new Date(shipment.estimatedDelivery).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default WorkerShipments;