
import { useState, useEffect } from "react";
import { FaTimes, FaMapMarker, FaComment, FaTruck, FaBox, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import toast from "react-hot-toast";

function UpdateStatusModal({ open, onClose, shipment, onUpdate }) {
    const [selectedStatus, setSelectedStatus] = useState(shipment?.status || "pending");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [suggestedLocations, setSuggestedLocations] = useState([]);

    useEffect(() => {
        if (open && shipment) {
            setSelectedStatus(shipment.status || "pending");
            setLocation("");
            setDescription("");
        }
    }, [open, shipment]);

    if (!open || !shipment) return null;

    const statusOptions = [
        { value: "label_generated", label: "Label Generated", color: "blue", icon: "🏷️", description: "Shipping label has been generated" },
        { value: "picked_up", label: "Picked Up", color: "purple", icon: "📦", description: "Package has been picked up by carrier" },
        { value: "in_transit", label: "In Transit", color: "yellow", icon: "🚚", description: "Shipment is on the way" },
        { value: "out_for_delivery", label: "Out for Delivery", color: "orange", icon: "🚛", description: "Out for delivery to customer" },
        { value: "delivered", label: "Delivered", color: "green", icon: "✅", description: "Successfully delivered" },
        { value: "failed", label: "Failed", color: "red", icon: "❌", description: "Delivery attempt failed" },
        { value: "returned", label: "Returned", color: "pink", icon: "🔄", description: "Package returned to sender" },
    ];

    const getStatusColorClass = (statusValue, type = "bg") => {
        const status = statusOptions.find(s => s.value === statusValue);
        const color = status?.color || "gray";

        const colorMap = {
            blue: { bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-300 dark:border-blue-700", text: "text-blue-700 dark:text-blue-400", ring: "ring-blue-500" },
            purple: { bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-300 dark:border-purple-700", text: "text-purple-700 dark:text-purple-400", ring: "ring-purple-500" },
            yellow: { bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-300 dark:border-yellow-700", text: "text-yellow-700 dark:text-yellow-400", ring: "ring-yellow-500" },
            orange: { bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-300 dark:border-orange-700", text: "text-orange-700 dark:text-orange-400", ring: "ring-orange-500" },
            green: { bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-300 dark:border-green-700", text: "text-green-700 dark:text-green-400", ring: "ring-green-500" },
            red: { bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-300 dark:border-red-700", text: "text-red-700 dark:text-red-400", ring: "ring-red-500" },
            pink: { bg: "bg-pink-50 dark:bg-pink-900/20", border: "border-pink-300 dark:border-pink-700", text: "text-pink-700 dark:text-pink-400", ring: "ring-pink-500" },
        };

        return colorMap[color]?.[type] || colorMap.blue[type];
    };

    const handleSubmit = async () => {
        if (selectedStatus === shipment.status && !location && !description) {
            toast.error("Please update status or add location/description");
            return;
        }

        setLoading(true);
        try {
            await onUpdate(shipment._id, {
                status: selectedStatus,
                location,
                description: description || `Status updated to ${selectedStatus.replace(/_/g, " ")}`,
            });
            toast.success(`Status updated to ${selectedStatus.replace(/_/g, " ")}`);
            onClose();
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    // Location suggestions based on status
    const getLocationSuggestions = () => {
        const suggestions = {
            label_generated: ["Mumbai Warehouse", "Delhi Hub", "Bangalore Sort Center"],
            picked_up: ["Customer Location", "Pickup Point", "Collection Center"],
            in_transit: ["Mumbai Transit Hub", "Delhi Gateway", "Bangalore Logistics Park"],
            out_for_delivery: ["Local Delivery Hub", "Area Distribution Center"],
            delivered: ["Customer Address", "Delivery Location"],
        };
        return suggestions[selectedStatus] || ["Warehouse", "Distribution Center", "Sorting Facility"];
    };

    const getCurrentStatusIndex = () => {
        const order = ["pending", "label_generated", "picked_up", "in_transit", "out_for_delivery", "delivered"];
        return order.indexOf(shipment.status);
    };

    const getSelectedStatusIndex = () => {
        const order = ["pending", "label_generated", "picked_up", "in_transit", "out_for_delivery", "delivered"];
        return order.indexOf(selectedStatus);
    };

    const isForwardMove = getSelectedStatusIndex() > getCurrentStatusIndex();
    const isBackwardMove = getSelectedStatusIndex() < getCurrentStatusIndex() && getSelectedStatusIndex() !== -1;

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
                            Update Shipment Status
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Track shipment {shipment.shipmentNumber}
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
                    {/* Current Status Info */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Current Status</p>
                                <p className="text-base sm:text-lg font-semibold capitalize flex items-center gap-2 mt-1">
                                    <span>{getStatusIcon(shipment.status)}</span>
                                    <span>{shipment.status?.replace(/_/g, " ")}</span>
                                </p>
                            </div>
                            {isForwardMove && (
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <FaTruck className="text-sm" />
                                    <span className="text-xs font-medium">Forward</span>
                                </div>
                            )}
                            {isBackwardMove && (
                                <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                    <FaExclamationTriangle className="text-sm" />
                                    <span className="text-xs font-medium">Regression</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Selection - Mobile (Vertical List) */}
                    <div className="sm:hidden space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Status <span className="text-red-500">*</span>
                        </label>
                        {statusOptions.map((status) => (
                            <label
                                key={status.value}
                                className={`
                                    flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer
                                    transition-all duration-200
                                    ${selectedStatus === status.value
                                        ? `${getStatusColorClass(status.value, 'bg')} ${getStatusColorClass(status.value, 'border')} shadow-md`
                                        : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                                    }
                                `}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value={status.value}
                                    checked={selectedStatus === status.value}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-4 h-4 accent-amber-500"
                                />
                                <span className="text-xl">{status.icon}</span>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-gray-800 dark:text-white">
                                        {status.label}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {status.description}
                                    </p>
                                </div>
                                {selectedStatus === status.value && (
                                    <FaCheckCircle className="text-green-500 text-sm" />
                                )}
                            </label>
                        ))}
                    </div>

                    {/* Status Selection - Desktop (Grid View) */}
                    <div className="hidden sm:grid sm:grid-cols-1 gap-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Status <span className="text-red-500">*</span>
                        </label>
                        {statusOptions.map((status) => (
                            <label
                                key={status.value}
                                className={`
                                    flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer
                                    transition-all duration-200
                                    ${selectedStatus === status.value
                                        ? `${getStatusColorClass(status.value, 'bg')} ${getStatusColorClass(status.value, 'border')} shadow-md`
                                        : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                                    }
                                `}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value={status.value}
                                    checked={selectedStatus === status.value}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-4 h-4 accent-amber-500"
                                />
                                <span className="text-2xl">{status.icon}</span>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-gray-800 dark:text-white">
                                        {status.label}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {status.description}
                                    </p>
                                </div>
                                {selectedStatus === status.value && (
                                    <FaCheckCircle className="text-green-500" />
                                )}
                            </label>
                        ))}
                    </div>

                    {/* Location Field */}
                    <div className="group">
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Location
                        </label>
                        <div className="relative">
                            <FaMapMarker className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g., Mumbai Hub, Delhi Sort Center"
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                            />
                        </div>

                        {/* Location Suggestions */}
                        {location.length === 0 && (
                            <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Suggestions:</p>
                                <div className="flex flex-wrap gap-2">
                                    {getLocationSuggestions().slice(0, 2).map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setLocation(suggestion)}
                                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Description Field */}
                    <div className="group">
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <div className="relative">
                            <FaComment className="absolute left-3 top-3 text-gray-400 text-sm" />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="3"
                                placeholder="Additional details about the shipment status..."
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition resize-none"
                            />
                        </div>
                    </div>

                    {/* Warning for Status Regression */}
                    {isBackwardMove && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-start gap-2">
                                <FaExclamationTriangle className="text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                                        Status Regression Warning
                                    </p>
                                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                        Moving from "{shipment.status?.replace(/_/g, " ")}" to "{selectedStatus.replace(/_/g, " ")}" may affect tracking accuracy.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Summary - Mobile Only */}
                    <div className="block sm:hidden mt-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Summary</p>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Shipment:</span>
                                <span className="font-medium font-mono">{shipment.shipmentNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">New Status:</span>
                                <span className="font-medium capitalize">{selectedStatus.replace(/_/g, " ")}</span>
                            </div>
                            {location && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Location:</span>
                                    <span className="font-medium truncate max-w-[200px]">{location}</span>
                                </div>
                            )}
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
                        {loading ? "Updating..." : "Update Status"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper function for status icon
const getStatusIcon = (status) => {
    const icons = {
        pending: "📝",
        label_generated: "🏷️",
        picked_up: "📦",
        in_transit: "🚚",
        out_for_delivery: "🚛",
        delivered: "✅",
        failed: "❌",
        returned: "🔄",
    };
    return icons[status] || "📋";
};


export default UpdateStatusModal;