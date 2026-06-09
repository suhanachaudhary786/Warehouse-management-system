
import { useState, useEffect } from "react";
import { FaTimes, FaArrowRight, FaCheckCircle } from "react-icons/fa";

function UpdateStatusModal({ open, onClose, order, onUpdate }) {
    const [selectedStatus, setSelectedStatus] = useState(order?.status || "created");
    const [loading, setLoading] = useState(false);
    const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

    useEffect(() => {
        if (order?.status) {
            setSelectedStatus(order.status);
        }
    }, [order]);

    if (!open || !order) return null;

    const statusOptions = [
        { value: "created", label: "Created", color: "gray", icon: "📝", description: "Order has been created" },
        { value: "allocated", label: "Allocated", color: "blue", icon: "📋", description: "Inventory allocated" },
        { value: "picking", label: "Picking", color: "purple", icon: "🤔", description: "Items being picked" },
        { value: "packed", label: "Packed", color: "yellow", icon: "📦", description: "Items packed ready" },
        { value: "shipped", label: "Shipped", color: "green", icon: "🚚", description: "Order shipped" },
        { value: "delivered", label: "Delivered", color: "emerald", icon: "✅", description: "Order delivered" },
        { value: "cancelled", label: "Cancelled", color: "red", icon: "❌", description: "Order cancelled" },
    ];

    const getStatusColorClass = (statusValue, type = "bg") => {
        const status = statusOptions.find(s => s.value === statusValue);
        const color = status?.color || "gray";

        const colorMap = {
            gray: { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-700", ring: "ring-gray-500" },
            blue: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", ring: "ring-blue-500" },
            purple: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700", ring: "ring-purple-500" },
            yellow: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", ring: "ring-yellow-500" },
            green: { bg: "bg-green-50", border: "border-green-300", text: "text-green-700", ring: "ring-green-500" },
            emerald: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", ring: "ring-emerald-500" },
            red: { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", ring: "ring-red-500" },
        };

        return colorMap[color]?.[type] || colorMap.gray[type];
    };

    const handleSubmit = async () => {
        if (selectedStatus === order.status) return;

        setLoading(true);
        try {
            await onUpdate(order._id, selectedStatus);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const currentIndex = statusOptions.findIndex(s => s.value === order.status);
    const selectedIndex = statusOptions.findIndex(s => s.value === selectedStatus);
    const isForwardMove = selectedIndex > currentIndex;
    const isBackwardMove = selectedIndex < currentIndex && selectedIndex !== -1;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl w-full max-w-md sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp">
                {/* Header - Responsive */}
                <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex justify-between items-center p-4 sm:p-6 border-b dark:border-slate-700">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                            Update Order Status
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Change order status and track progress
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
                    {/* Order Info Card */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-xl p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order Number</p>
                        <p className="text-lg sm:text-xl font-mono font-bold text-gray-800 dark:text-white">
                            {order.orderNumber}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Customer: <span className="font-medium">{order.customerName}</span>
                        </p>
                    </div>

                    {/* Current Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-xl sm:text-2xl">
                                {statusOptions.find(s => s.value === order.status)?.icon}
                            </span>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Current Status</p>
                                <p className="text-base sm:text-lg font-semibold capitalize text-gray-800 dark:text-white">
                                    {order.status}
                                </p>
                            </div>
                        </div>
                        {isForwardMove && (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <FaArrowRight />
                                <span className="text-xs sm:text-sm font-medium">Moving Forward</span>
                            </div>
                        )}
                        {isBackwardMove && (
                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                <span>⚠️</span>
                                <span className="text-xs sm:text-sm font-medium">Status Regression</span>
                            </div>
                        )}
                    </div>

                    {/* Status Timeline - Desktop */}
                    <div className="hidden sm:block">
                        <div className="relative">
                            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-slate-700"></div>
                            <div className="relative flex justify-between">
                                {statusOptions.slice(0, 6).map((status, idx) => (
                                    <div key={status.value} className="flex flex-col items-center">
                                        <button
                                            onClick={() => setSelectedStatus(status.value)}
                                            className={`
                                                w-10 h-10 rounded-full flex items-center justify-center text-lg
                                                transition-all duration-200 relative z-10
                                                ${selectedStatus === status.value
                                                    ? `${getStatusColorClass(status.value, 'bg')} ring-2 ${getStatusColorClass(status.value, 'ring')} scale-110`
                                                    : 'bg-gray-100 dark:bg-slate-700 hover:scale-105'
                                                }
                                            `}
                                        >
                                            {status.icon}
                                        </button>
                                        <span className={`text-xs mt-2 font-medium capitalize ${selectedStatus === status.value ? getStatusColorClass(status.value, 'text') : 'text-gray-500'}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Status Options - Mobile (Vertical List) */}
                    <div className="sm:hidden space-y-2">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Select New Status:
                        </p>
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
                                <span className="text-xl sm:text-2xl">{status.icon}</span>
                                <div className="flex-1">
                                    <p className="font-semibold text-sm sm:text-base capitalize text-gray-800 dark:text-white">
                                        {status.label}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {status.description}
                                    </p>
                                </div>
                                {selectedStatus === status.value && (
                                    <FaCheckCircle className="text-green-500 text-base sm:text-lg" />
                                )}
                            </label>
                        ))}
                    </div>

                    {/* Status Options - Tablet/Desktop (Grid View) */}
                    <div className="hidden sm:grid sm:grid-cols-2 gap-3">
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
                                    <p className="font-semibold text-sm capitalize text-gray-800 dark:text-white">
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

                    {/* Warning for Status Change */}
                    {selectedStatus !== order.status && (
                        <div className={`
                            p-3 sm:p-4 rounded-xl text-xs sm:text-sm
                            ${isBackwardMove
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800'
                                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
                            }
                        `}>
                            <div className="flex items-start gap-2">
                                <span className="text-base">{isBackwardMove ? "⚠️" : "ℹ️"}</span>
                                <div>
                                    <p className="font-semibold">
                                        {isBackwardMove ? "Status Regression Warning" : "Status Update"}
                                    </p>
                                    <p className="mt-1">
                                        {isBackwardMove
                                            ? `Moving from "${order.status}" to "${selectedStatus}" may affect order tracking.`
                                            : `Order status will be updated from "${order.status}" to "${selectedStatus}".`
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
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
                        disabled={loading || selectedStatus === order.status}
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


export default UpdateStatusModal;