
import { FaTimes, FaBox, FaShoppingCart, FaUser, FaCalendar, FaClipboardList, FaTag, FaWeightHanging, FaClock, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";

function ReturnDetailsModal({ open, onClose, returnItem, onRestock, onDamage, onQuarantine }) {
    if (!open || !returnItem) return null;

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
            inspected: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            restocked: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            damaged: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
            quarantined: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
        };
        return colors[status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: "⏳",
            inspected: "🔍",
            restocked: "✅",
            damaged: "❌",
            quarantined: "⚠️",
        };
        return icons[status] || "📋";
    };

    const getStatusDisplay = (status) => {
        return status?.charAt(0).toUpperCase() + status?.slice(1) || status;
    };

    const statusActions = {
        pending: [
            { label: "Restock", action: onRestock, color: "green", icon: "✅", description: "Return item to inventory" },
            { label: "Mark Damaged", action: onDamage, color: "red", icon: "❌", description: "Item is damaged/unusable" },
            { label: "Quarantine", action: onQuarantine, color: "purple", icon: "⚠️", description: "Isolate for quality check" },
        ],
    };

    const handleAction = (action) => {
        action(returnItem._id);
        onClose();
    };

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
                            Return Details
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Complete return information and actions
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
                    {/* Header Info Card */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Return ID</p>
                                <p className="text-sm sm:text-base font-mono font-semibold text-gray-800 dark:text-white">
                                    {returnItem._id?.slice(-8).toUpperCase()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                                <span className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(returnItem.status)}`}>
                                    <span className="text-base sm:text-lg">{getStatusIcon(returnItem.status)}</span>
                                    <span className="capitalize">{getStatusDisplay(returnItem.status)}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Information Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                        <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                <FaShoppingCart className="text-amber-500" /> Order Information
                            </h3>
                        </div>
                        <div className="p-4 sm:p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaTag className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Order Number</p>
                                        <p className="text-sm sm:text-base font-mono font-medium text-gray-800 dark:text-white">
                                            {returnItem.order?.orderNumber}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaUser className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                            {returnItem.order?.customerName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaCalendar className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Order Date</p>
                                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                            {new Date(returnItem.order?.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaInfoCircle className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Order Status</p>
                                        <p className="text-sm sm:text-base capitalize text-gray-700 dark:text-gray-300">
                                            {returnItem.order?.status}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Information Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                        <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                <FaBox className="text-amber-500" /> Product Information
                            </h3>
                        </div>
                        <div className="p-4 sm:p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaTag className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">SKU Code</p>
                                        <p className="text-sm sm:text-base font-mono font-medium text-gray-800 dark:text-white">
                                            {returnItem.sku?.skuCode}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaBox className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Product Name</p>
                                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                            {returnItem.sku?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaClipboardList className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Quantity Returned</p>
                                        <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                                            {returnItem.qty} units
                                        </p>
                                    </div>
                                </div>
                                {returnItem.sku?.weight && (
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <FaWeightHanging className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Weight per Unit</p>
                                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                                {returnItem.sku?.weight} kg
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Total Weight */}
                            {returnItem.sku?.weight && (
                                <div className="mt-4 pt-3 border-t dark:border-slate-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Total Weight:</span>
                                        <span className="font-semibold text-gray-800 dark:text-white">
                                            {(returnItem.qty * returnItem.sku?.weight).toFixed(2)} kg
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Return Reason Card */}
                    {returnItem.reason && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                            <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                    <FaClipboardList className="text-amber-500" /> Return Reason
                                </h3>
                            </div>
                            <div className="p-4 sm:p-5">
                                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {returnItem.reason}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timeline Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                        <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                <FaClock className="text-amber-500" /> Timeline
                            </h3>
                        </div>
                        <div className="p-4 sm:p-5">
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <FaCalendar className="text-gray-400 text-sm sm:text-base" />
                                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Return Created:</span>
                                    </div>
                                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-mono">
                                        {new Date(returnItem.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <FaCheckCircle className="text-gray-400 text-sm sm:text-base" />
                                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Last Updated:</span>
                                    </div>
                                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-mono">
                                        {new Date(returnItem.updatedAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Processing Info for Non-Pending Returns */}
                    {returnItem.status !== "pending" && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <FaInfoCircle className="text-blue-500 text-lg mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                                        Return Processed
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                        This return has been processed and cannot be modified.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons for Pending Returns */}
                {returnItem.status === "pending" && statusActions.pending && (
                    <div className="border-t dark:border-slate-700 p-4 sm:p-6">
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-3 text-sm sm:text-base">
                            Process Return
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {statusActions.pending.map((action) => (
                                <button
                                    key={action.label}
                                    onClick={() => handleAction(action.action)}
                                    className={`
                                        flex flex-col items-center gap-2 px-4 py-3 rounded-xl 
                                        transition-all duration-200 transform hover:scale-105
                                        bg-${action.color}-500 hover:bg-${action.color}-600 
                                        text-white shadow-md hover:shadow-lg
                                    `}
                                >
                                    <span className="text-2xl">{action.icon}</span>
                                    <span className="font-semibold text-sm">{action.label}</span>
                                    <span className="text-xs opacity-90">{action.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer - Responsive */}
                <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t dark:border-slate-700 p-4 sm:p-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="border dark:border-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition text-sm sm:text-base"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}


export default ReturnDetailsModal;