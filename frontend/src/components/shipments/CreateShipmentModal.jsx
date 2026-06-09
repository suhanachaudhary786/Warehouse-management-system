
import { useState, useEffect } from "react";
import api from "../../api/api";
import { FaTimes, FaBox, FaTruck, FaWeightHanging, FaRuler, FaCalendar, FaUser, FaTag } from "react-icons/fa";
import toast from "react-hot-toast";

function CreateShipmentModal({ open, onClose, refresh }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
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
            if (child.includes(".")) {
                const [grandParent, grandChild] = child.split(".");
                setForm({
                    ...form,
                    [parent]: {
                        ...form[parent],
                        [grandParent]: {
                            ...form[parent]?.[grandParent],
                            [grandChild]: value
                        }
                    },
                });
            } else {
                setForm({
                    ...form,
                    [parent]: { ...form[parent], [child]: value },
                });
            }
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleOrderSelect = (orderId) => {
        const selectedOrder = orders.find(o => o._id === orderId);
        setSelectedOrderDetails(selectedOrder);
        setForm({ ...form, orderId });
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
            // Reset form
            setForm({
                orderId: "",
                carrier: "blue_dart",
                serviceType: "standard",
                packageDetails: {
                    weight: 1,
                    dimensions: { length: 10, width: 10, height: 10 },
                },
            });
            setSelectedOrderDetails(null);
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to create shipment");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    // Calculate volume
    const volume = form.packageDetails.dimensions.length *
        form.packageDetails.dimensions.width *
        form.packageDetails.dimensions.height / 1000; // in liters

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp">
                {/* Header - Responsive */}
                <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex justify-between items-center p-4 sm:p-6 border-b dark:border-slate-700">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                            Create Shipment
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Create new shipment for order
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-2xl hover:text-gray-500 dark:hover:text-gray-400 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    >
                        <FaTimes className="text-lg sm:text-xl" />
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                    {/* Select Order Field */}
                    <div className="group">
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            Select Order <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <select
                                name="orderId"
                                value={form.orderId}
                                onChange={(e) => handleOrderSelect(e.target.value)}
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                            >
                                <option value="">Choose an order...</option>
                                {orders.map((order) => (
                                    <option key={order._id} value={order._id}>
                                        {order.orderNumber} - {order.customerName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selected Order Details */}
                        {selectedOrderDetails && (
                            <div className="mt-2 p-2 sm:p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                    <div>
                                        <span className="text-gray-500">Order #:</span>
                                        <p className="font-mono font-semibold">{selectedOrderDetails.orderNumber}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Customer:</span>
                                        <p>{selectedOrderDetails.customerName}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Items:</span>
                                        <p>{selectedOrderDetails.items?.length || 0} SKUs</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Status:</span>
                                        <p className="capitalize">{selectedOrderDetails.status}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Carrier Field */}
                    <div className="group">
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            Carrier
                        </label>
                        <div className="relative">
                            <FaTruck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <select
                                name="carrier"
                                value={form.carrier}
                                onChange={handleChange}
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition capitalize"
                            >
                                <option value="fedex">FedEx</option>
                                <option value="dhl">DHL</option>
                                <option value="ups">UPS</option>
                                <option value="blue_dart">Blue Dart</option>
                                <option value="delhivery">Delhivery</option>
                            </select>
                        </div>
                    </div>

                    {/* Service Type Field */}
                    <div className="group">
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            Service Type
                        </label>
                        <div className="relative">
                            <FaBox className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <select
                                name="serviceType"
                                value={form.serviceType}
                                onChange={handleChange}
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition capitalize"
                            >
                                <option value="standard">Standard</option>
                                <option value="express">Express</option>
                                <option value="overnight">Overnight</option>
                            </select>
                        </div>
                    </div>

                    {/* Weight Field */}
                    <div className="group">
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            Weight (kg)
                        </label>
                        <div className="relative">
                            <FaWeightHanging className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="number"
                                name="packageDetails.weight"
                                value={form.packageDetails.weight}
                                onChange={handleChange}
                                min="0.1"
                                step="0.1"
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                                placeholder="Enter weight in kg"
                            />
                        </div>
                    </div>

                    {/* Dimensions Section */}
                    <div>
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            Package Dimensions (cm)
                        </label>
                        <div className="relative">
                            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                <div>
                                    <input
                                        type="number"
                                        name="packageDetails.dimensions.length"
                                        value={form.packageDetails.dimensions.length}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full border dark:border-slate-700 rounded-xl p-2.5 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                                        placeholder="Length"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        name="packageDetails.dimensions.width"
                                        value={form.packageDetails.dimensions.width}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full border dark:border-slate-700 rounded-xl p-2.5 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                                        placeholder="Width"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        name="packageDetails.dimensions.height"
                                        value={form.packageDetails.dimensions.height}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full border dark:border-slate-700 rounded-xl p-2.5 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                                        placeholder="Height"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Package Volume Display */}
                        <div className="mt-2 text-right">
                            <span className="text-xs text-gray-500">
                                Volume: {volume.toFixed(2)} liters
                            </span>
                        </div>
                    </div>

                    {/* Form Summary - Mobile Only */}
                    <div className="block sm:hidden mt-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Summary</p>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Order:</span>
                                <span className="font-medium">{form.orderId ? "Selected" : "Not selected"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Carrier:</span>
                                <span className="font-medium capitalize">{form.carrier?.replace("_", " ")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Service:</span>
                                <span className="font-medium capitalize">{form.serviceType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Weight:</span>
                                <span className="font-medium">{form.packageDetails.weight} kg</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Responsive */}
                <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t dark:border-slate-700 p-4 sm:p-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="border dark:border-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50 text-sm sm:text-base order-2 sm:order-1"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2 text-sm sm:text-base"
                    >
                        {loading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        {loading ? "Creating..." : "Create Shipment"}
                    </button>
                </div>
            </div>
        </div>
    );
}


export default CreateShipmentModal;