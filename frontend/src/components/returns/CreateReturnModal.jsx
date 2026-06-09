
import { useState, useEffect } from "react";
import api from "../../api/api";
import { FaTimes, FaShoppingCart, FaBox, FaHashtag, FaClipboardList, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";

function CreateReturnModal({ open, onClose, refresh }) {
    const [orders, setOrders] = useState([]);
    const [skus, setSkus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [selectedSkuDetails, setSelectedSkuDetails] = useState(null);
    const [maxQuantity, setMaxQuantity] = useState(1);
    const [form, setForm] = useState({
        order: "",
        sku: "",
        qty: 1,
        reason: "",
    });

    useEffect(() => {
        if (open) {
            fetchOrders();
            fetchSkus();
            resetForm();
        }
    }, [open]);

    const resetForm = () => {
        setForm({
            order: "",
            sku: "",
            qty: 1,
            reason: "",
        });
        setSelectedOrderDetails(null);
        setSelectedSkuDetails(null);
        setMaxQuantity(1);
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get("/orders");
            // Filter delivered orders for returns
            const deliveredOrders = res.data.data.filter(
                (order) => order.status === "delivered"
            );
            setOrders(deliveredOrders);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch orders");
        }
    };

    const fetchSkus = async () => {
        try {
            const res = await api.get("/skus");
            setSkus(res.data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleOrderSelect = (orderId) => {
        const selectedOrder = orders.find(o => o._id === orderId);
        setSelectedOrderDetails(selectedOrder);
        setForm({ ...form, order: orderId, sku: "", qty: 1 });
        setSelectedSkuDetails(null);
        setMaxQuantity(1);
    };

    const handleSkuSelect = (skuId) => {
        const selectedSku = skus.find(s => s._id === skuId);
        setSelectedSkuDetails(selectedSku);

        // Check if this SKU was in the order
        const orderItem = selectedOrderDetails?.items?.find(
            item => item.sku?._id === skuId
        );

        const availableQty = orderItem?.qty || 1;
        setMaxQuantity(availableQty);

        setForm({ ...form, sku: skuId, qty: 1 });
    };

    const handleSubmit = async () => {
        if (!form.order) {
            toast.error("Please select an order");
            return;
        }
        if (!form.sku) {
            toast.error("Please select a SKU");
            return;
        }
        if (form.qty < 1) {
            toast.error("Quantity must be at least 1");
            return;
        }
        if (form.qty > maxQuantity) {
            toast.error(`Maximum return quantity is ${maxQuantity} units`);
            return;
        }

        setLoading(true);
        try {
            await api.post("/returns/create", form);
            toast.success("Return created successfully");
            refresh();
            onClose();
            resetForm();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to create return");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    // Get reason suggestions based on common scenarios
    const reasonSuggestions = [
        "Product is damaged",
        "Wrong item received",
        "Size doesn't fit",
        "Quality issues",
        "Missing parts",
        "Changed my mind",
        "Better price available",
        "Late delivery",
    ];

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
                            Create Return
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Process customer return request
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
                    {/* Order Selection */}
                    <div className="group">
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            Order <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FaShoppingCart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <select
                                name="order"
                                value={form.order}
                                onChange={(e) => handleOrderSelect(e.target.value)}
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                            >
                                <option value="">Select order...</option>
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
                                        <span className="text-gray-500">Order Date:</span>
                                        <p>{new Date(selectedOrderDetails.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Items:</span>
                                        <p>{selectedOrderDetails.items?.length || 0} products</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SKU Selection */}
                    <div className="group">
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            Product (SKU) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FaBox className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <select
                                name="sku"
                                value={form.sku}
                                onChange={(e) => handleSkuSelect(e.target.value)}
                                disabled={!form.order}
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Select SKU...</option>
                                {skus.map((sku) => (
                                    <option key={sku._id} value={sku._id}>
                                        {sku.skuCode} - {sku.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selected SKU Details */}
                        {selectedSkuDetails && (
                            <div className="mt-2 p-2 sm:p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                    <div>
                                        <span className="text-gray-500">SKU Code:</span>
                                        <p className="font-mono">{selectedSkuDetails.skuCode}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Category:</span>
                                        <p>{selectedSkuDetails.category || "N/A"}</p>
                                    </div>
                                    {selectedSkuDetails.weight && (
                                        <div>
                                            <span className="text-gray-500">Weight:</span>
                                            <p>{selectedSkuDetails.weight} kg</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500">Max Return:</span>
                                        <p className="font-semibold text-amber-600">{maxQuantity} units</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quantity Field */}
                    <div className="group">
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            Quantity <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FaHashtag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="number"
                                name="qty"
                                value={form.qty}
                                onChange={handleChange}
                                min="1"
                                max={maxQuantity}
                                disabled={!form.sku}
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        {form.sku && (
                            <p className="mt-1 text-xs text-gray-500">
                                Maximum allowed: {maxQuantity} units (based on order quantity)
                            </p>
                        )}
                    </div>

                    {/* Reason Field with Suggestions */}
                    <div className="group">
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            Reason for Return
                        </label>
                        <div className="relative">
                            <FaClipboardList className="absolute left-3 top-3 text-gray-400 text-sm sm:text-base" />
                            <textarea
                                name="reason"
                                value={form.reason}
                                onChange={handleChange}
                                rows="3"
                                placeholder="e.g., Damaged product, Wrong item, Size issue, etc."
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 pl-9 sm:pl-10 pr-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition resize-none"
                            />
                        </div>

                        {/* Reason Suggestions */}
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Quick suggestions:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {reasonSuggestions.slice(0, 4).map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setForm({ ...form, reason: suggestion })}
                                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Form Summary - Mobile Only */}
                    <div className="block sm:hidden mt-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Summary</p>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Order:</span>
                                <span className="font-medium">{form.order ? "Selected" : "Not selected"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Product:</span>
                                <span className="font-medium">{form.sku ? "Selected" : "Not selected"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Quantity:</span>
                                <span className="font-medium">{form.qty} units</span>
                            </div>
                        </div>
                    </div>

                    {/* Warning Message */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start gap-2">
                            <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 mt-0.5 text-sm" />
                            <div>
                                <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">
                                    Return Policy Notice
                                </p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                    Returns are subject to inspection. Refund will be processed after quality check.
                                </p>
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
                        disabled={loading || !form.order || !form.sku}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2 text-sm sm:text-base"
                    >
                        {loading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        {loading ? "Creating..." : "Create Return"}
                    </button>
                </div>
            </div>
        </div>
    );
}


export default CreateReturnModal;