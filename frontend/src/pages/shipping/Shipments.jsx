
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
    }, []);

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
            pending: "bg-gray-100 text-gray-600",
            label_generated: "bg-blue-100 text-blue-600",
            picked_up: "bg-purple-100 text-purple-600",
            in_transit: "bg-yellow-100 text-yellow-600",
            out_for_delivery: "bg-orange-100 text-orange-600",
            delivered: "bg-green-100 text-green-600",
            failed: "bg-red-100 text-red-600",
            returned: "bg-pink-100 text-pink-600",
        };
        return colors[status] || "bg-gray-100 text-gray-600";
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

    const filteredShipments = shipments.filter((shipment) => {
        const matchesSearch =
            shipment.shipmentNumber?.toLowerCase().includes(search.toLowerCase()) ||
            shipment.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
            shipment.order?.customerName?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter ? shipment.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: shipments.length,
        inTransit: shipments.filter(s => ["picked_up", "in_transit", "out_for_delivery"].includes(s.status)).length,
        delivered: shipments.filter(s => s.status === "delivered").length,
        failed: shipments.filter(s => s.status === "failed").length,
    };

    return (
        <DashboardLayout>
            <div className="p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                            Shipments
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Manage and track all shipments
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedShipment(null);
                            setOpenModal(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition"
                    >
                        <FaPlus /> Create Shipment
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Shipments</p>
                                <h2 className="text-2xl font-bold">{stats.total}</h2>
                            </div>
                            <FaBox className="text-amber-500 text-2xl" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">In Transit</p>
                                <h2 className="text-2xl font-bold text-yellow-600">{stats.inTransit}</h2>
                            </div>
                            <FaTruck className="text-yellow-500 text-2xl" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Delivered</p>
                                <h2 className="text-2xl font-bold text-green-600">{stats.delivered}</h2>
                            </div>
                            <FaMapMarker className="text-green-500 text-2xl" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Failed</p>
                                <h2 className="text-2xl font-bold text-red-600">{stats.failed}</h2>
                            </div>
                            <FaBox className="text-red-500 text-2xl" />
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by shipment #, tracking #, or customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 border rounded-xl py-3 focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="label_generated">Label Generated</option>
                        <option value="picked_up">Picked Up</option>
                        <option value="in_transit">In Transit</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>

                {/* Shipments Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-slate-700">
                                <tr>
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
                                ) : filteredShipments.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-10 text-gray-500">
                                            No shipments found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredShipments.map((shipment) => (
                                        <tr key={shipment._id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                                            <td className="p-4">
                                                <p className="font-mono font-semibold text-sm">{shipment.shipmentNumber}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-mono text-sm">{shipment.trackingNumber}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-medium">{shipment.order?.customerName}</p>
                                                <p className="text-xs text-gray-500">{shipment.order?.orderNumber}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="capitalize">{shipment.carrier?.replace("_", " ")}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(shipment.status)}`}>
                                                    <span>{getStatusIcon(shipment.status)}</span>
                                                    <span className="capitalize">{shipment.status?.replace("_", " ")}</span>
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