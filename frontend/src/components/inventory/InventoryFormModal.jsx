
import { useEffect, useState } from "react";
import api from "../../api/api";
import { FaTimes, FaBox, FaMapMarkerAlt, FaBoxes, FaTag, FaCheckCircle } from "react-icons/fa";

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
    const [selectedSkuDetails, setSelectedSkuDetails] = useState(null);
    const [selectedBinDetails, setSelectedBinDetails] = useState(null);

    const [form, setForm] = useState({
        sku: "",
        bin: "",
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
            // Set details for display
            if (selectedInventory?.sku) {
                setSelectedSkuDetails(selectedInventory.sku);
            }
            if (selectedInventory?.bin) {
                setSelectedBinDetails(selectedInventory.bin);
            }
        } else {
            setForm({
                sku: "",
                bin: "",
                qty: "",
                status: "available",
            });
            setSelectedSkuDetails(null);
            setSelectedBinDetails(null);
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
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value,
        });

        // Update details when SKU or Bin is selected
        if (name === "sku" && value) {
            const sku = skus.find(s => s._id === value);
            setSelectedSkuDetails(sku || null);
        } else if (name === "sku" && !value) {
            setSelectedSkuDetails(null);
        }

        if (name === "bin" && value) {
            const bin = bins.find(b => b._id === value);
            setSelectedBinDetails(bin || null);
        } else if (name === "bin" && !value) {
            setSelectedBinDetails(null);
        }
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

        // Check bin capacity
        if (selectedBinDetails && form.qty > (selectedBinDetails.remainingVolume || selectedBinDetails.volumeCapacity)) {
            setError(`Quantity exceeds bin capacity. Maximum available: ${selectedBinDetails.remainingVolume || selectedBinDetails.volumeCapacity}`);
            return;
        }

        setLoading(true);
        setError("");

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

    const getStatusColor = (status) => {
        switch (status) {
            case "available": return "text-green-600 bg-green-50 dark:bg-green-900/20";
            case "allocated": return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
            case "picked": return "text-purple-600 bg-purple-50 dark:bg-purple-900/20";
            case "hold": return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
            case "damaged": return "text-red-600 bg-red-50 dark:bg-red-900/20";
            default: return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-3 sm:p-4 animate-fadeIn"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp">
                {/* Header - Responsive */}
                <div className="flex justify-between items-center border-b dark:border-slate-700 p-4 sm:p-6 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                            {selectedInventory ? "Edit Inventory" : "Add Inventory"}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {selectedInventory ? "Update inventory details" : "Add new stock to warehouse"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-2xl hover:text-gray-500 dark:hover:text-gray-400 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    >
                        <FaTimes className="text-lg sm:text-xl" />
                    </button>
                </div>

                {/* Body - Responsive */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm sm:text-base animate-shake">
                            <div className="flex items-start gap-2">
                                <span className="text-lg">⚠️</span>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* SKU Field */}
                    <div className="group">
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            SKU <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <select
                                name="sku"
                                value={form.sku}
                                onChange={handleChange}
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                            >
                                <option value="">Select SKU</option>
                                {skus.map((sku) => (
                                    <option key={sku._id} value={sku._id}>
                                        {sku.skuCode} - {sku.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* SKU Details - Show when selected */}
                        {selectedSkuDetails && (
                            <div className="mt-2 p-2 sm:p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                    <div>
                                        <span className="text-gray-500">SKU Code:</span>
                                        <p className="font-mono font-semibold">{selectedSkuDetails.skuCode}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Category:</span>
                                        <p>{selectedSkuDetails.category || "N/A"}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Description:</span>
                                        <p className="text-xs">{selectedSkuDetails.description || "No description"}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bin Field */}
                    <div className="group">
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            Bin Location <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <select
                                name="bin"
                                value={form.bin}
                                onChange={handleChange}
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                            >
                                <option value="">Select Bin</option>
                                {bins.map((bin) => (
                                    <option key={bin._id} value={bin._id}>
                                        {bin.code} (Capacity: {bin.remainingVolume || bin.volumeCapacity} / {bin.volumeCapacity})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Bin Details - Show when selected */}
                        {selectedBinDetails && (
                            <div className="mt-2 p-2 sm:p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                    <div>
                                        <span className="text-gray-500">Zone:</span>
                                        <p>{selectedBinDetails.zone || "N/A"}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Capacity:</span>
                                        <p>{selectedBinDetails.volumeCapacity} units</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Available:</span>
                                        <p className="text-green-600 font-semibold">{selectedBinDetails.remainingVolume || selectedBinDetails.volumeCapacity} units</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Status:</span>
                                        <p className={`capitalize ${selectedBinDetails.status === "AVAILABLE" ? "text-green-600" : "text-yellow-600"}`}>
                                            {selectedBinDetails.status || "Available"}
                                        </p>
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
                            <FaBoxes className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="number"
                                name="qty"
                                value={form.qty}
                                onChange={handleChange}
                                min="1"
                                step="1"
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                                placeholder="Enter quantity"
                            />
                        </div>
                        {selectedBinDetails && form.qty && (
                            <p className={`mt-1 text-xs ${Number(form.qty) > (selectedBinDetails.remainingVolume || selectedBinDetails.volumeCapacity) ? 'text-red-500' : 'text-green-500'}`}>
                                {Number(form.qty) > (selectedBinDetails.remainingVolume || selectedBinDetails.volumeCapacity)
                                    ? `Exceeds available capacity by ${Number(form.qty) - (selectedBinDetails.remainingVolume || selectedBinDetails.volumeCapacity)} units`
                                    : `${(selectedBinDetails.remainingVolume || selectedBinDetails.volumeCapacity) - Number(form.qty)} units will remain available`}
                            </p>
                        )}
                    </div>

                    {/* Status Field */}
                    <div className="group">
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            Status
                        </label>
                        <div className="relative">
                            <FaCheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition capitalize"
                            >
                                <option value="available">Available</option>
                                <option value="allocated">Allocated</option>
                                <option value="picked">Picked</option>
                                <option value="hold">Hold</option>
                                <option value="damaged">Damaged</option>
                            </select>
                        </div>
                    </div>

                    <div className="block sm:hidden mt-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Summary</p>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">SKU:</span>
                                <span className="font-medium">{form.sku ? "Selected" : "Not selected"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Bin:</span>
                                <span className="font-medium">{form.bin ? "Selected" : "Not selected"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Quantity:</span>
                                <span className="font-medium">{form.qty || 0} units</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                <span className={`capitalize ${getStatusColor(form.status)}`}>{form.status}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Responsive */}
                <div className="border-t dark:border-slate-700 p-4 sm:p-6 flex flex-col-reverse sm:flex-row justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="border dark:border-slate-700 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50 text-sm sm:text-base order-2 sm:order-1"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
                    >
                        {loading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        <span className="text-sm sm:text-base">
                            {selectedInventory
                                ? (loading ? "Updating..." : "Update Inventory")
                                : (loading ? "Creating..." : "Create Inventory")
                            }
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}


export default InventoryFormModal;