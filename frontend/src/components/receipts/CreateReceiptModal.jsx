
import { useState, useEffect } from "react";
import api from "../../api/api";
import { FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

function CreateReceiptModal({ open, onClose, refresh }) {
    const [skus, setSkus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        supplier: "",
        expectedDate: "",
        items: [{ sku: "", expectedQty: 1 }],
        notes: "",
    });

    useEffect(() => {
        if (open) {
            fetchSkus();
        }
    }, [open]);

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
        setForm({ ...form, [name]: value });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...form.items];
        newItems[index][field] = value;
        setForm({ ...form, items: newItems });
    };

    const addItem = () => {
        setForm({
            ...form,
            items: [...form.items, { sku: "", expectedQty: 1 }],
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
        if (!form.supplier) {
            toast.error("Supplier name is required");
            return;
        }
        if (form.items.some(item => !item.sku)) {
            toast.error("Please select SKU for all items");
            return;
        }
        if (form.items.some(item => item.expectedQty < 1)) {
            toast.error("Quantity must be at least 1");
            return;
        }

        setLoading(true);
        try {
            await api.post("/receipts", form);
            toast.success("Receipt created successfully");
            refresh();
            onClose();
            setForm({
                supplier: "",
                expectedDate: "",
                items: [{ sku: "", expectedQty: 1 }],
                notes: "",
            });
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to create receipt");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Create Receipt (ASN)</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Supplier */}
                    <div>
                        <label className="block mb-2 font-medium">Supplier *</label>
                        <input
                            type="text"
                            name="supplier"
                            value={form.supplier}
                            onChange={handleChange}
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                            placeholder="e.g., Tech Suppliers Inc."
                        />
                    </div>

                    {/* Expected Date */}
                    <div>
                        <label className="block mb-2 font-medium">Expected Date</label>
                        <input
                            type="date"
                            name="expectedDate"
                            value={form.expectedDate}
                            onChange={handleChange}
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    {/* Items */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Items</h3>
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
                                            value={item.expectedQty}
                                            onChange={(e) => handleItemChange(index, "expectedQty", parseInt(e.target.value))}
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
                    <button onClick={onClose} className="px-5 py-3 border rounded-xl">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Receipt"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateReceiptModal;