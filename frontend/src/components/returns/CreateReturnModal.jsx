
import { useState, useEffect } from "react";
import api from "../../api/api";
import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

function CreateReturnModal({ open, onClose, refresh }) {
    const [orders, setOrders] = useState([]);
    const [skus, setSkus] = useState([]);
    const [loading, setLoading] = useState(false);
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
        }
    }, [open]);

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

        setLoading(true);
        try {
            await api.post("/returns/create", form);
            toast.success("Return created successfully");
            refresh();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to create return");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Create Return</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block mb-2 font-medium">Order *</label>
                        <select
                            name="order"
                            value={form.order}
                            onChange={handleChange}
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Select order...</option>
                            {orders.map((order) => (
                                <option key={order._id} value={order._id}>
                                    {order.orderNumber} - {order.customerName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Product (SKU) *</label>
                        <select
                            name="sku"
                            value={form.sku}
                            onChange={handleChange}
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Select SKU...</option>
                            {skus.map((sku) => (
                                <option key={sku._id} value={sku._id}>
                                    {sku.skuCode} - {sku.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Quantity *</label>
                        <input
                            type="number"
                            name="qty"
                            value={form.qty}
                            onChange={handleChange}
                            min="1"
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Reason for Return</label>
                        <textarea
                            name="reason"
                            value={form.reason}
                            onChange={handleChange}
                            rows="3"
                            placeholder="e.g., Damaged product, Wrong item, Size issue, etc."
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                        />
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
                        {loading ? "Creating..." : "Create Return"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateReturnModal;