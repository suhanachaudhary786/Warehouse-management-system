
// components/shipments/CreateShipmentModal.jsx
import { useState, useEffect } from "react";
import api from "../../api/api";
import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

function CreateShipmentModal({ open, onClose, refresh }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        orderId: "",
        carrier: "blue_dart",
        serviceType: "standard",
        packageDetails: {
            weight: 1,
            dimensions: { length: 10, width: 10, height: 10 },
        },
    });

    useEffect(() => {
        if (open) {
            fetchOrders();
        }
    }, [open]);

    const fetchOrders = async () => {
        try {
            const res = await api.get("/orders");
            // Filter orders that are allocated or packed but not shipped
            const eligibleOrders = res.data.data.filter(
                (order) => ["allocated", "packed"].includes(order.status)
            );
            setOrders(eligibleOrders);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch orders");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setForm({
                ...form,
                [parent]: { ...form[parent], [child]: value },
            });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async () => {
        if (!form.orderId) {
            toast.error("Please select an order");
            return;
        }

        setLoading(true);
        try {
            await api.post("/shipments", form);
            toast.success("Shipment created successfully");
            refresh();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to create shipment");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Create Shipment</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block mb-2 font-medium">Select Order *</label>
                        <select
                            name="orderId"
                            value={form.orderId}
                            onChange={handleChange}
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Choose an order...</option>
                            {orders.map((order) => (
                                <option key={order._id} value={order._id}>
                                    {order.orderNumber} - {order.customerName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Carrier</label>
                        <select
                            name="carrier"
                            value={form.carrier}
                            onChange={handleChange}
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="fedex">FedEx</option>
                            <option value="dhl">DHL</option>
                            <option value="ups">UPS</option>
                            <option value="blue_dart">Blue Dart</option>
                            <option value="delhivery">Delhivery</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Service Type</label>
                        <select
                            name="serviceType"
                            value={form.serviceType}
                            onChange={handleChange}
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="standard">Standard</option>
                            <option value="express">Express</option>
                            <option value="overnight">Overnight</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Weight (kg)</label>
                        <input
                            type="number"
                            name="packageDetails.weight"
                            value={form.packageDetails.weight}
                            onChange={handleChange}
                            min="0.1"
                            step="0.1"
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block mb-2 font-medium text-sm">Length (cm)</label>
                            <input
                                type="number"
                                name="packageDetails.dimensions.length"
                                value={form.packageDetails.dimensions.length}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-sm">Width (cm)</label>
                            <input
                                type="number"
                                name="packageDetails.dimensions.width"
                                value={form.packageDetails.dimensions.width}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block mb-2 font-medium text-sm">Height (cm)</label>
                            <input
                                type="number"
                                name="packageDetails.dimensions.height"
                                value={form.packageDetails.dimensions.height}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t p-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-3 border rounded-xl">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Shipment"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateShipmentModal;