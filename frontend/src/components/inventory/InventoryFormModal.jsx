
import { useEffect, useState } from "react";
import api from "../../api/api";

function InventoryFormModal({
    open,
    onClose,
    selectedInventory,
    refresh,
}) {
    const [skus, setSkus] = useState([]);
    const [bins, setBins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        sku: "",        // Changed from sku_id to match backend
        bin: "",        // Changed from bin_id to match backend
        qty: "",
        status: "available",
    });

    useEffect(() => {
        if (open) {
            fetchDropdowns();
        }
    }, [open]);

    useEffect(() => {
        if (selectedInventory) {
            setForm({
                sku: selectedInventory?.sku?._id || "",
                bin: selectedInventory?.bin?._id || "",
                qty: selectedInventory.qty || "",
                status: selectedInventory.status || "available",
            });
        } else {
            setForm({
                sku: "",
                bin: "",
                qty: "",
                status: "available",
            });
        }
        setError("");
    }, [selectedInventory, open]);

    const fetchDropdowns = async () => {
        try {
            const skuRes = await api.get("/skus");
            const binRes = await api.get("/bins");

            setSkus(skuRes.data.data || []);
            setBins(binRes.data.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    if (!open) return null;

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        // Validation
        if (!form.sku) {
            setError("Please select a SKU");
            return;
        }

        if (!form.bin) {
            setError("Please select a Bin");
            return;
        }

        if (!form.qty) {
            setError("Please enter quantity");
            return;
        }

        if (form.qty <= 0) {
            setError("Quantity must be greater than 0");
            return;
        }

        setLoading(true);
        setError("");

        // Prepare data matching backend schema
        const inventoryData = {
            sku: form.sku,
            bin: form.bin,
            qty: Number(form.qty),
            status: form.status,
        };

        try {
            if (selectedInventory) {
                await api.put(`/inventory/${selectedInventory._id}`, inventoryData);
            } else {
                await api.post("/inventory", inventoryData);
            }

            refresh();
            onClose();
        } catch (error) {
            console.log(error);
            setError(error?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center border-b p-6">
                    <h2 className="text-2xl font-bold">
                        {selectedInventory ? "Edit Inventory" : "Add Inventory"}
                    </h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* SKU */}
                    <div>
                        <label className="block mb-2 font-medium">
                            SKU <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="sku"
                            value={form.sku}
                            onChange={handleChange}
                            className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Select SKU</option>
                            {skus.map((sku) => (
                                <option key={sku._id} value={sku._id}>
                                    {sku.skuCode} - {sku.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Bin */}
                    <div>
                        <label className="block mb-2 font-medium">
                            Bin <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="bin"
                            value={form.bin}
                            onChange={handleChange}
                            className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Select Bin</option>
                            {bins.map((bin) => (
                                <option key={bin._id} value={bin._id}>
                                    {bin.code} (Available: {bin.remainingVolume || 0} / {bin.volumeCapacity})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block mb-2 font-medium">
                            Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="qty"
                            value={form.qty}
                            onChange={handleChange}
                            min="1"
                            step="1"
                            className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
                            placeholder="Enter quantity"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block mb-2 font-medium">Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="available">Available</option>
                            <option value="allocated">Allocated</option>
                            <option value="picked">Picked</option>
                            <option value="hold">Hold</option>
                            <option value="damaged">Damaged</option>
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-6 flex flex-col sm:flex-row justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="border px-5 py-3 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        {selectedInventory ? (loading ? "Updating..." : "Update Inventory") : (loading ? "Creating..." : "Create Inventory")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InventoryFormModal;