
import { useState, useEffect } from "react";
import api from "../../api/api";
import { FaTimes, FaBarcode, FaBox, FaRuler, FaInfoCircle, FaWeightHanging, FaTachometerAlt, FaTags, FaCheckCircle, FaExclamationTriangle, FaPlus, FaSave } from "react-icons/fa";

function SKUFormModal({ open, onClose, selectedSku, refresh }) {
    const [form, setForm] = useState({
        skuCode: "",
        name: "",
        length: "",
        width: "",
        height: "",
        weight: "",
        velocityClass: "MEDIUM",
        handlingClasses: [],
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Handling classes options
    const handlingOptions = [
        "FRAGILE",
        "ELECTRONICS",
        "HIGH_VALUE",
        "BULKY",
        "ASSEMBLY_REQUIRED",
        "SMALL",
        "CONSUMABLE",
        "DURABLE",
        "REUSABLE",
        "CHEMICALS",
        "LIQUID",
        "FLAMMABLE",
    ];

    // Populate form when editing
    useEffect(() => {
        if (selectedSku) {
            setForm({
                skuCode: selectedSku.skuCode || "",
                name: selectedSku.name || "",
                length: selectedSku.length || "",
                width: selectedSku.width || "",
                height: selectedSku.height || "",
                weight: selectedSku.weight || "",
                velocityClass: selectedSku.velocityClass || "MEDIUM",
                handlingClasses: selectedSku.handlingClasses || [],
            });
        } else {
            // Reset form when adding new
            setForm({
                skuCode: "",
                name: "",
                length: "",
                width: "",
                height: "",
                weight: "",
                velocityClass: "MEDIUM",
                handlingClasses: [],
            });
        }
        setError("");
        setSuccessMessage("");
    }, [selectedSku, open]);

    if (!open) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckbox = (value) => {
        setForm((prev) => ({
            ...prev,
            handlingClasses: prev.handlingClasses.includes(value)
                ? prev.handlingClasses.filter((item) => item !== value)
                : [...prev.handlingClasses, value],
        }));
    };

    // Reset form for next SKU
    const resetForm = () => {
        setForm({
            skuCode: "",
            name: "",
            length: "",
            width: "",
            height: "",
            weight: "",
            velocityClass: "MEDIUM",
            handlingClasses: [],
        });
        setError("");
    };

    // Save and optionally add another
    const saveSKU = async (shouldAddAnother = false) => {
        // Validation
        if (!form.skuCode) {
            setError("SKU Code is required");
            return false;
        }

        if (!form.name) {
            setError("SKU Name is required");
            return false;
        }

        if (!form.weight) {
            setError("Weight is required");
            return false;
        }

        if (form.weight <= 0) {
            setError("Weight must be greater than 0");
            return false;
        }

        // Prepare data
        const skuData = {
            skuCode: form.skuCode,
            name: form.name,
            length: form.length ? Number(form.length) : undefined,
            width: form.width ? Number(form.width) : undefined,
            height: form.height ? Number(form.height) : undefined,
            weight: Number(form.weight),
            velocityClass: form.velocityClass,
            handlingClasses: form.handlingClasses,
        };

        try {
            if (selectedSku) {
                await api.put(`/skus/${selectedSku._id}`, skuData);
                setSuccessMessage("SKU updated successfully!");
                refresh();
                if (!shouldAddAnother) {
                    onClose();
                }
                return true;
            } else {
                await api.post("/skus", skuData);
                setSuccessMessage("SKU created successfully!");
                refresh();

                if (shouldAddAnother) {
                    // Reset form for next SKU
                    resetForm();
                    // Clear success message after 2 seconds
                    setTimeout(() => setSuccessMessage(""), 2000);
                    return true;
                } else {
                    onClose();
                    return true;
                }
            }
        } catch (err) {
            console.error("Error:", err);

            if (err.response?.data?.message?.includes("duplicate") ||
                err.response?.data?.message?.includes("skuCode")) {
                setError("SKU Code already exists. Please use a unique code.");
            } else {
                setError(
                    err.response?.data?.message ||
                    `Failed to ${selectedSku ? "update" : "create"} SKU`
                );
            }
            return false;
        }
    };

    const handleSubmit = async (e, shouldAddAnother = false) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccessMessage("");

        await saveSKU(shouldAddAnother);

        setLoading(false);
    };

    const getVelocityIcon = (velocity) => {
        const icons = {
            FAST: "⚡",
            MEDIUM: "🟡",
            SLOW: "🐢",
        };
        return icons[velocity] || "📦";
    };

    const getVelocityColor = (velocity) => {
        const colors = {
            FAST: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
            MEDIUM: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
            SLOW: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
        };
        return colors[velocity] || "text-gray-600 bg-gray-50";
    };

    // Calculate volume
    const volume = form.length && form.width && form.height
        ? (Number(form.length) * Number(form.width) * Number(form.height) / 1000).toFixed(2)
        : null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp">
                <form onSubmit={(e) => handleSubmit(e, false)}>
                    {/* Header - Responsive */}
                    <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex justify-between items-center p-4 sm:p-6 border-b dark:border-slate-700">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                                {selectedSku ? "Edit SKU" : "Create SKU"}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {selectedSku ? "Update SKU information" : "Add new product to catalog"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-2xl hover:text-gray-500 dark:hover:text-gray-400 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                        >
                            <FaTimes className="text-lg sm:text-xl" />
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                        {/* Success Message */}
                        {successMessage && (
                            <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm sm:text-base">
                                <div className="flex items-start gap-2">
                                    <FaCheckCircle className="text-lg mt-0.5" />
                                    <span>{successMessage}</span>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm sm:text-base animate-shake">
                                <div className="flex items-start gap-2">
                                    <FaExclamationTriangle className="text-lg mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        {/* SKU Code Field */}
                        <div className="group">
                            <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                                SKU Code <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FaBarcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                                <input
                                    type="text"
                                    name="skuCode"
                                    value={form.skuCode}
                                    onChange={handleInputChange}
                                    required
                                    disabled={!!selectedSku}
                                    className={`w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition
                                        ${selectedSku ? "bg-gray-100 dark:bg-slate-700 cursor-not-allowed opacity-70" : ""}
                                    `}
                                    placeholder="e.g., ELEC-LAP-001"
                                />
                            </div>
                            {selectedSku && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                    <FaInfoCircle className="text-xs" />
                                    SKU Code cannot be changed after creation
                                </p>
                            )}
                        </div>

                        {/* SKU Name Field */}
                        <div className="group">
                            <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                                SKU Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FaBox className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                                    placeholder="e.g., Gaming Laptop Pro X"
                                />
                            </div>
                        </div>

                        {/* Dimensions Section */}
                        <div className="space-y-2">
                            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                                Dimensions (cm)
                            </label>
                            <div className="relative">
                                <FaRuler className="absolute left-3 top-4 text-gray-400 text-sm sm:text-base" />
                                <div className="grid grid-cols-3 gap-2 sm:gap-3 pl-7 sm:pl-8">
                                    <input
                                        type="number"
                                        name="length"
                                        value={form.length}
                                        onChange={handleInputChange}
                                        step="0.1"
                                        placeholder="Length"
                                        className="w-full border dark:border-slate-700 rounded-xl p-2.5 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                                    />
                                    <input
                                        type="number"
                                        name="width"
                                        value={form.width}
                                        onChange={handleInputChange}
                                        step="0.1"
                                        placeholder="Width"
                                        className="w-full border dark:border-slate-700 rounded-xl p-2.5 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                                    />
                                    <input
                                        type="number"
                                        name="height"
                                        value={form.height}
                                        onChange={handleInputChange}
                                        step="0.1"
                                        placeholder="Height"
                                        className="w-full border dark:border-slate-700 rounded-xl p-2.5 sm:p-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                                    />
                                </div>
                            </div>
                            {volume && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                    Volume: {volume} liters
                                </p>
                            )}
                        </div>

                        {/* Weight Field */}
                        <div className="group">
                            <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                                Weight (Kg) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <FaWeightHanging className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                                <input
                                    type="number"
                                    name="weight"
                                    value={form.weight}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                    min="0.01"
                                    className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                                    placeholder="e.g., 2.5"
                                />
                            </div>
                        </div>

                        {/* Velocity Class Field */}
                        <div className="group">
                            <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                                Velocity Class
                            </label>
                            <div className="relative">
                                <FaTachometerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                                <select
                                    name="velocityClass"
                                    value={form.velocityClass}
                                    onChange={handleInputChange}
                                    className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                                >
                                    <option value="FAST">⚡ FAST (High moving)</option>
                                    <option value="MEDIUM">🟡 MEDIUM (Medium moving)</option>
                                    <option value="SLOW">🐢 SLOW (Low moving)</option>
                                </select>
                            </div>
                            <div className="mt-2">
                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getVelocityColor(form.velocityClass)}`}>
                                    <span>{getVelocityIcon(form.velocityClass)}</span>
                                    <span>{form.velocityClass}</span>
                                </span>
                            </div>
                        </div>

                        {/* Handling Classes Section */}
                        <div className="space-y-2">
                            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                                <FaTags className="inline mr-2 text-amber-500" />
                                Handling Classes
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 sm:p-3 border dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800">
                                {handlingOptions.map((option) => (
                                    <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-white dark:hover:bg-slate-700 p-1 rounded transition">
                                        <input
                                            type="checkbox"
                                            checked={form.handlingClasses.includes(option)}
                                            onChange={() => handleCheckbox(option)}
                                            className="cursor-pointer w-4 h-4 accent-amber-500"
                                        />
                                        <span className="cursor-pointer text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                            {option}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            {/* Selected Handling Classes Display */}
                            {form.handlingClasses.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-1">Selected classes:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {form.handlingClasses.map((item) => (
                                            <span
                                                key={item}
                                                className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full text-xs font-medium"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Form Summary - Mobile Only */}
                        <div className="block sm:hidden mt-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Summary</p>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">SKU Code:</span>
                                    <span className="font-mono font-medium">{form.skuCode || "Not set"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Name:</span>
                                    <span className="font-medium truncate max-w-[200px]">{form.name || "Not set"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Weight:</span>
                                    <span className="font-medium">{form.weight ? `${form.weight} kg` : "Not set"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer - Responsive with Save & Add Another Button */}
                    <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t dark:border-slate-700 p-4 sm:p-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="border dark:border-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50 text-sm sm:text-base order-2 sm:order-1"
                        >
                            Cancel
                        </button>

                        {/* 🟢 "Save & Add Another" Button - Only for new SKU (not edit mode) */}
                        {!selectedSku && (
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, true)}
                                disabled={loading}
                                className="border-2 border-amber-500 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 order-3 text-sm sm:text-base"
                            >
                                <FaPlus className="text-sm" />
                                {loading ? "Saving..." : "Save & Add Another"}
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2 text-sm sm:text-base"
                        >
                            {loading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            <FaSave className="text-sm" />
                            {loading ? "Saving..." : (selectedSku ? "Update SKU" : "Create SKU")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SKUFormModal;