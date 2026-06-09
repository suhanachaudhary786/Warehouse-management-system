
import { useState, useEffect } from "react";
import api from "../../api/api";
import { FaTimes, FaPlus, FaTrash, FaBox, FaCalendar, FaUser, FaStickyNote, FaTruck } from "react-icons/fa";
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

    // Calculate total items
    const totalItems = form.items.reduce((sum, item) => sum + (item.expectedQty || 0), 0);

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp">
                {/* Header - Responsive */}
                <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex justify-between items-center p-4 sm:p-6 border-b dark:border-slate-700">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                            Create Receipt (ASN)
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Create advance shipping notice for incoming goods
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-2xl hover:text-gray-500 dark:hover:text-gray-400 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    >
                        <FaTimes className="text-lg sm:text-xl" />
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Form Summary - Mobile Only */}
                    <div className="block sm:hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Items</p>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{form.items.length}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Quantity</p>
                                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{totalItems}</p>
                            </div>
                            <FaTruck className="text-amber-500 text-2xl" />
                        </div>
                    </div>

                    {/* Supplier Field */}
                    <div className="group">
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            Supplier <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="text"
                                name="supplier"
                                value={form.supplier}
                                onChange={handleChange}
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                                placeholder="e.g., Tech Suppliers Inc."
                            />
                        </div>
                    </div>

                    {/* Expected Date Field */}
                    <div className="group">
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            Expected Date
                        </label>
                        <div className="relative">
                            <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="date"
                                name="expectedDate"
                                value={form.expectedDate}
                                onChange={handleChange}
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                            />
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                    <FaBox className="text-amber-500" /> Items
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Add products to this receipt
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 transition text-sm w-full sm:w-auto justify-center"
                            >
                                <FaPlus className="text-xs sm:text-sm" /> Add Item
                            </button>
                        </div>

                        {/* Items List - Desktop */}
                        <div className="hidden sm:block space-y-3">
                            {form.items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-start bg-gray-50 dark:bg-slate-800 p-3 rounded-xl">
                                    <div className="flex-1">
                                        <select
                                            value={item.sku}
                                            onChange={(e) => handleItemChange(index, "sku", e.target.value)}
                                            className="w-full border dark:border-slate-600 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
                                        >
                                            <option value="">Select SKU</option>
                                            {skus.map((sku) => (
                                                <option key={sku._id} value={sku._id}>
                                                    {sku.skuCode} - {sku.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-36">
                                        <input
                                            type="number"
                                            value={item.expectedQty}
                                            onChange={(e) => handleItemChange(index, "expectedQty", parseInt(e.target.value) || 0)}
                                            min="1"
                                            className="w-full border dark:border-slate-600 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
                                            placeholder="Qty"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Items List - Mobile (Card Style) */}
                        <div className="sm:hidden space-y-3">
                            {form.items.map((item, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                            Item {index + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="text-red-500 p-1"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">SKU</label>
                                        <select
                                            value={item.sku}
                                            onChange={(e) => handleItemChange(index, "sku", e.target.value)}
                                            className="w-full border dark:border-slate-600 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
                                        >
                                            <option value="">Select SKU</option>
                                            {skus.map((sku) => (
                                                <option key={sku._id} value={sku._id}>
                                                    {sku.skuCode} - {sku.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Expected Quantity</label>
                                        <input
                                            type="number"
                                            value={item.expectedQty}
                                            onChange={(e) => handleItemChange(index, "expectedQty", parseInt(e.target.value) || 0)}
                                            min="1"
                                            className="w-full border dark:border-slate-600 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
                                            placeholder="Quantity"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Items Summary */}
                        {form.items.length > 1 && (
                            <div className="text-right text-xs sm:text-sm text-gray-600 dark:text-gray-400 pt-2">
                                Total SKUs: {form.items.length} | Total Units: {totalItems}
                            </div>
                        )}
                    </div>

                    {/* Notes Field */}
                    <div className="group">
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            Notes
                        </label>
                        <div className="relative">
                            <FaStickyNote className="absolute left-3 top-3 text-gray-400 text-sm sm:text-base" />
                            <textarea
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                rows="3"
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition resize-none"
                                placeholder="Any special instructions or notes..."
                            />
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
                        {loading ? "Creating..." : "Create Receipt"}
                    </button>
                </div>
            </div>
        </div>
    );
}


export default CreateReceiptModal;