
import { useState, useEffect } from "react";
import api from "../../api/api";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

function OrderFormModal({ open, onClose, selectedOrder, refresh }) {
    const [skus, setSkus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        shippingAddress: {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "India",
        },
        items: [{ sku: "", qty: 1 }],
        priority: "medium",
        notes: "",
    });

    useEffect(() => {
        if (open) {
            fetchSkus();
        }
    }, [open]);

    useEffect(() => {
        if (selectedOrder) {
            setForm({
                customerName: selectedOrder.customerName || "",
                customerEmail: selectedOrder.customerEmail || "",
                customerPhone: selectedOrder.customerPhone || "",
                shippingAddress: selectedOrder.shippingAddress || {
                    street: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "India",
                },
                items: selectedOrder.items || [{ sku: "", qty: 1 }],
                priority: selectedOrder.priority || "medium",
                notes: selectedOrder.notes || "",
            });
        }
    }, [selectedOrder]);

    const fetchSkus = async () => {
        try {
            const res = await api.get("/skus");
            setSkus(res.data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    if (!open) return null;

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

    const handleItemChange = (index, field, value) => {
        const newItems = [...form.items];
        newItems[index][field] = value;
        setForm({ ...form, items: newItems });
    };

    const addItem = () => {
        setForm({
            ...form,
            items: [...form.items, { sku: "", qty: 1 }],
        });
    };

    const removeItem = (index) => {
        if (form.items.length === 1) {
            toast.error("At least one item is required");
            return;
        }
        const newItems = form.items.filter((_, i) => i !== index);
        setForm({ ...form, items: newItems });
    };

    const handleSubmit = async () => {
        // Validation
        if (!form.customerName) {
            toast.error("Customer name is required");
            return;
        }
        if (form.items.some(item => !item.sku)) {
            toast.error("Please select SKU for all items");
            return;
        }
        if (form.items.some(item => item.qty < 1)) {
            toast.error("Quantity must be at least 1");
            return;
        }

        setLoading(true);
        try {
            if (selectedOrder) {
                await api.put(`/orders/${selectedOrder._id}`, form);
                toast.success("Order updated successfully");
            } else {
                await api.post("/orders", form);
                toast.success("Order created successfully");
            }
            refresh();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">
                        {selectedOrder ? "Edit Order" : "Create Order"}
                    </h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Customer Information */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-medium">
                                    Customer Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={form.customerName}
                                    onChange={handleChange}
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Email</label>
                                <input
                                    type="email"
                                    name="customerEmail"
                                    value={form.customerEmail}
                                    onChange={handleChange}
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Phone</label>
                                <input
                                    type="tel"
                                    name="customerPhone"
                                    value={form.customerPhone}
                                    onChange={handleChange}
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                                    placeholder="+91 1234567890"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Priority</label>
                                <select
                                    name="priority"
                                    value={form.priority}
                                    onChange={handleChange}
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block mb-2 font-medium">Street</label>
                                <input
                                    type="text"
                                    name="shippingAddress.street"
                                    value={form.shippingAddress.street}
                                    onChange={handleChange}
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                                    placeholder="123 Main St"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">City</label>
                                <input
                                    type="text"
                                    name="shippingAddress.city"
                                    value={form.shippingAddress.city}
                                    onChange={handleChange}
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">State</label>
                                <input
                                    type="text"
                                    name="shippingAddress.state"
                                    value={form.shippingAddress.state}
                                    onChange={handleChange}
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">ZIP Code</label>
                                <input
                                    type="text"
                                    name="shippingAddress.zipCode"
                                    value={form.shippingAddress.zipCode}
                                    onChange={handleChange}
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium">Country</label>
                                <input
                                    type="text"
                                    name="shippingAddress.country"
                                    value={form.shippingAddress.country}
                                    onChange={handleChange}
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Order Items</h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-amber-500 hover:text-amber-600 flex items-center gap-1"
                            >
                                <FaPlus /> Add Item
                            </button>
                        </div>
                        <div className="space-y-3">
                            {form.items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-start">
                                    <div className="flex-1">
                                        <select
                                            value={item.sku}
                                            onChange={(e) => handleItemChange(index, "sku", e.target.value)}
                                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                                        >
                                            <option value="">Select SKU</option>
                                            {skus.map((sku) => (
                                                <option key={sku._id} value={sku._id}>
                                                    {sku.skuCode} - {sku.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-32">
                                        <input
                                            type="number"
                                            value={item.qty}
                                            onChange={(e) => handleItemChange(index, "qty", parseInt(e.target.value))}
                                            min="1"
                                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                                            placeholder="Qty"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block mb-2 font-medium">Notes</label>
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                            placeholder="Any special instructions..."
                        />
                    </div>
                </div>

                <div className="border-t p-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-3 border rounded-xl hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition disabled:opacity-50"
                    >
                        {loading ? "Processing..." : (selectedOrder ? "Update Order" : "Create Order")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrderFormModal;