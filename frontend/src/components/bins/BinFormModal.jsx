
import { useEffect, useState } from "react";
import api from "../../api/api";

function BinFormModal({
    open,
    onClose,
    selectedBin,
    refresh,
}) {
    const [form, setForm] = useState({
        code: "",
        x: "",
        y: "",
        volumeCapacity: "",
        maxWeight: "",
        allowedHandlingClasses: [], // Changed from allowed_handling_classes
        status: "AVAILABLE",     // Changed from "active" to match backend enum
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (selectedBin) {
            setForm({
                code: selectedBin.code || "",
                x: selectedBin.x || "",
                y: selectedBin.y || "",
                volumeCapacity: selectedBin.volumeCapacity || "",
                maxWeight: selectedBin.maxWeight || "",
                allowedHandlingClasses: selectedBin.allowedHandlingClasses || [],
                status: selectedBin.status || "AVAILABLE",
            });
        } else {
            setForm({
                code: "",
                x: "",
                y: "",
                volumeCapacity: "",
                maxWeight: "",
                allowedHandlingClasses: [],
                status: "AVAILABLE",
            });
        }
        setError("");
    }, [selectedBin, open]);

    if (!open) return null;

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleCheckbox = (value) => {
        setForm((prev) => ({
            ...prev,
            allowedHandlingClasses: prev.allowedHandlingClasses.includes(value)
                ? prev.allowedHandlingClasses.filter((item) => item !== value)
                : [...prev.allowedHandlingClasses, value],
        }));
    };

    const handleSubmit = async () => {
        // Validation
        if (!form.code) {
            setError("Bin code is required");
            return;
        }

        if (!form.volumeCapacity) {
            setError("Volume capacity is required");
            return;
        }

        if (form.volumeCapacity <= 0) {
            setError("Volume capacity must be greater than 0");
            return;
        }

        setLoading(true);
        setError("");

        // Prepare data matching backend schema
        const binData = {
            code: form.code,
            x: form.x ? Number(form.x) : undefined,
            y: form.y ? Number(form.y) : undefined,
            volumeCapacity: Number(form.volumeCapacity),
            remainingVolume: selectedBin ? selectedBin.remainingVolume : Number(form.volumeCapacity), // Default to full capacity
            maxWeight: form.maxWeight ? Number(form.maxWeight) : undefined,
            allowedHandlingClasses: form.allowedHandlingClasses,
            status: form.status,
        };

        try {
            if (selectedBin) {
                await api.put(`/bins/${selectedBin._id}`, binData);
            } else {
                await api.post("/bins", binData);
            }

            refresh();
            onClose();
        } catch (error) {
            console.log(error);

            if (error?.response?.data?.message?.includes("duplicate")) {
                setError("Bin code already exists. Please use a unique code.");
            } else {
                setError(error?.response?.data?.message || "Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    const handlingClasses = [
        "FRAGILE",
        "ELECTRONICS",
        "HIGH_VALUE",
        "BULKY",
        "ASSEMBLY_REQUIRED",
        "SMALL",
        "CONSUMABLE",
        "DURABLE",
        "CHEMICALS",
        "LIQUID",
        "FLAMMABLE",
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-3">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl md:text-2xl font-bold">
                        {selectedBin ? "Edit Bin" : "Create Bin"}
                    </h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 font-medium">
                                Bin Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={form.code}
                                onChange={handleChange}
                                disabled={!!selectedBin}
                                className={`w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500
                                    ${selectedBin ? "bg-gray-100 cursor-not-allowed" : ""}
                                `}
                                placeholder="e.g., A-01-01"
                            />
                            {selectedBin && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Bin code cannot be changed after creation
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block mb-2 font-medium">Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="AVAILABLE">Available</option>
                                <option value="FULL">Full</option>
                            </select>
                        </div>
                    </div>

                    {/* Coordinates */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Coordinates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label>X Coordinate</label>
                                <input
                                    type="number"
                                    name="x"
                                    value={form.x}
                                    onChange={handleChange}
                                    step="1"
                                    className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
                                    placeholder="e.g., 10"
                                />
                            </div>
                            <div>
                                <label>Y Coordinate</label>
                                <input
                                    type="number"
                                    name="y"
                                    value={form.y}
                                    onChange={handleChange}
                                    step="1"
                                    className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
                                    placeholder="e.g., 5"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Capacity */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Capacity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-medium">
                                    Volume Capacity <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="volumeCapacity"
                                    value={form.volumeCapacity}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    step="1"
                                    className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
                                    placeholder="e.g., 1000"
                                />
                                <p className="text-xs text-gray-500 mt-1">Cubic units</p>
                            </div>

                            <div>
                                <label>Max Weight (Kg)</label>
                                <input
                                    type="number"
                                    name="maxWeight"
                                    value={form.maxWeight}
                                    onChange={handleChange}
                                    min="0"
                                    step="1"
                                    className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
                                    placeholder="e.g., 500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Handling Classes */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Allowed Handling Classes</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                            {handlingClasses.map((item) => (
                                <label
                                    key={item}
                                    className="flex items-center gap-2 border rounded-xl p-3 cursor-pointer hover:bg-gray-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.allowedHandlingClasses.includes(item)}
                                        onChange={() => handleCheckbox(item)}
                                        className="cursor-pointer"
                                    />
                                    <span className="capitalize cursor-pointer">
                                        {item.toLowerCase().replace("_", " ")}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {form.allowedHandlingClasses.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {form.allowedHandlingClasses.map((item) => (
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
                </div>

                {/* Footer */}
                <div className="border-t p-6 flex flex-col sm:flex-row justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-3 border rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        {selectedBin ? (loading ? "Updating..." : "Update Bin") : (loading ? "Creating..." : "Create Bin")}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BinFormModal;