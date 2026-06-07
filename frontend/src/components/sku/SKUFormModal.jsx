
import { useState, useEffect } from "react";
import api from "../../api/api";

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Validation
        if (!form.skuCode) {
            setError("SKU Code is required");
            setLoading(false);
            return;
        }

        if (!form.name) {
            setError("SKU Name is required");
            setLoading(false);
            return;
        }

        if (!form.weight) {
            setError("Weight is required");
            setLoading(false);
            return;
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
                // Update existing SKU
                await api.put(`/skus/${selectedSku._id}`, skuData);
            } else {
                // Create new SKU
                await api.post("/skus", skuData);
            }

            // Refresh the list and close modal
            refresh();
            onClose();
        } catch (err) {
            console.error("Error:", err);

            // Handle duplicate SKU code error
            if (err.response?.data?.message?.includes("duplicate") ||
                err.response?.data?.message?.includes("skuCode")) {
                setError("SKU Code already exists. Please use a unique code.");
            } else {
                setError(
                    err.response?.data?.message ||
                    `Failed to ${selectedSku ? "update" : "create"} SKU`
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh]">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-bold mb-6">
                        {selectedSku ? "Edit SKU" : "Create SKU"}
                    </h2>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* SKU Code */}
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">
                            SKU Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="skuCode"
                            value={form.skuCode}
                            onChange={handleInputChange}
                            required
                            disabled={!!selectedSku}
                            className={`w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500
                ${selectedSku ? "bg-gray-100 cursor-not-allowed" : ""}
              `}
                            placeholder="e.g., ELEC-LAP-001"
                        />
                        {selectedSku && (
                            <p className="text-xs text-gray-500 mt-1">
                                SKU Code cannot be changed after creation
                            </p>
                        )}
                    </div>

                    {/* SKU Name */}
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">
                            SKU Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleInputChange}
                            required
                            className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
                            placeholder="e.g., Gaming Laptop Pro X"
                        />
                    </div>

                    {/* Dimensions */}
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">Dimensions (cm)</label>
                        <div className="grid grid-cols-3 gap-3">
                            <input
                                type="number"
                                name="length"
                                value={form.length}
                                onChange={handleInputChange}
                                step="0.1"
                                placeholder="Length"
                                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                            />
                            <input
                                type="number"
                                name="width"
                                value={form.width}
                                onChange={handleInputChange}
                                step="0.1"
                                placeholder="Width"
                                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                            />
                            <input
                                type="number"
                                name="height"
                                value={form.height}
                                onChange={handleInputChange}
                                step="0.1"
                                placeholder="Height"
                                className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                    </div>

                    {/* Weight */}
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">
                            Weight (Kg) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="weight"
                            value={form.weight}
                            onChange={handleInputChange}
                            required
                            step="0.01"
                            min="0"
                            className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
                            placeholder="e.g., 2.5"
                        />
                    </div>

                    {/* Velocity Class */}
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">Velocity Class</label>
                        <select
                            name="velocityClass"
                            value={form.velocityClass}
                            onChange={handleInputChange}
                            className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="FAST">FAST (High moving)</option>
                            <option value="MEDIUM">MEDIUM (Medium moving)</option>
                            <option value="SLOW">SLOW (Low moving)</option>
                        </select>
                    </div>

                    {/* Handling Classes */}
                    <div className="mb-6">
                        <label className="block mb-2 font-medium">Handling Classes</label>
                        <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto p-2 border rounded-xl">
                            {handlingOptions.map((option) => (
                                <label key={option} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.handlingClasses.includes(option)}
                                        onChange={() => handleCheckbox(option)}
                                        className="cursor-pointer"
                                    />
                                    <span className="cursor-pointer text-sm">{option}</span>
                                </label>
                            ))}
                        </div>
                        {form.handlingClasses.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {form.handlingClasses.map((item) => (
                                    <span
                                        key={item}
                                        className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Form Buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-3 border rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : (selectedSku ? "Update SKU" : "Create SKU")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SKUFormModal;