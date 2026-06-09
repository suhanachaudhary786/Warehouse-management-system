
import { FaTimes, FaBox, FaUser, FaMapMarker, FaCalendar, FaClock, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

function TaskDetailsModal({ open, onClose, task, refresh }) {
    if (!open || !task) return null;

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
            assigned: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            in_progress: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
            completed: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            cancelled: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        };
        return colors[status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    const getPriorityColor = (priority) => {
        const colors = {
            1: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
            2: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
            3: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
            4: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            5: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        };
        return colors[priority] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    const getPriorityLabel = (priority) => {
        const labels = {
            1: "Critical",
            2: "High",
            3: "Medium",
            4: "Low",
            5: "Lowest",
        };
        return labels[priority] || "Medium";
    };

    const getTaskTypeIcon = (type) => {
        const icons = {
            pick: "📦",
            pack: "📋",
            ship: "🚚",
            putaway: "📥",
            receive: "📋",
            move: "🔄",
        };
        return icons[type] || "📋";
    };

    const getTaskTypeColor = (type) => {
        const colors = {
            pick: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            pack: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
            ship: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            putaway: "bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400",
            receive: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
            move: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
        };
        return colors[type] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    // Safe data extraction helpers
    const getSkuCode = () => {
        if (task.sku?.skuCode) return task.sku.skuCode;
        if (task.inventory?.sku?.skuCode) return task.inventory.sku.skuCode;
        return "N/A";
    };

    const getSkuName = () => {
        if (task.sku?.name) return task.sku.name;
        if (task.inventory?.sku?.name) return task.inventory.sku.name;
        return "Task Item";
    };

    const getWeight = () => {
        const weight = task.sku?.weight || task.inventory?.sku?.weight;
        return weight ? `${weight} kg` : "N/A";
    };

    const getDimensions = () => {
        const dimensions = task.sku?.dimensions || task.inventory?.sku?.dimensions;
        if (dimensions && typeof dimensions === 'object') {
            return `${dimensions.length || 0} × ${dimensions.width || 0} × ${dimensions.height || 0} cm`;
        }
        return "N/A";
    };

    const getOrderNumber = () => {
        if (task.order?.orderNumber) return task.order.orderNumber;
        if (task.orderNumber) return task.orderNumber;
        return "N/A";
    };

    const getCustomerName = () => {
        if (task.order?.customerName) return task.order.customerName;
        return "N/A";
    };

    const getReceiptNumber = () => {
        if (task.receipt?.receiptNumber) return task.receipt.receiptNumber;
        if (task.receiptNumber) return task.receiptNumber;
        return "N/A";
    };

    const getAssignedWorkerName = () => {
        if (!task.assignedTo) return null;

        // If assignedTo is an object with name property
        if (typeof task.assignedTo === 'object' && task.assignedTo.name) {
            return task.assignedTo.name;
        }

        // If assignedTo is just a string ID
        if (typeof task.assignedTo === 'string') {
            return "Worker ID: " + task.assignedTo.slice(-8);
        }

        return "Unknown Worker";
    };

    const getAssignedWorkerEmail = () => {
        if (!task.assignedTo) return null;

        // If assignedTo is an object with email property
        if (typeof task.assignedTo === 'object' && task.assignedTo.email) {
            return task.assignedTo.email;
        }

        return null;
    };

    const getAssignedWorkerInitial = () => {
        const name = getAssignedWorkerName();
        if (name && name !== "Unknown Worker" && !name.startsWith("Worker ID:")) {
            return name.charAt(0).toUpperCase();
        }
        return "W";
    };

    // Check if assigned worker exists
    const hasAssignedWorker = task.assignedTo && getAssignedWorkerName();


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
                            Task Details
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Complete task information
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
                    {/* Task Header Card */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-2xl">
                                    {getTaskTypeIcon(task.taskType)}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Task ID</p>
                                    <p className="text-sm sm:text-base font-mono font-semibold text-gray-800 dark:text-white">
                                        {task._id?.slice(-8).toUpperCase()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                                    {getPriorityLabel(task.priority)} Priority
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(task.status)}`}>
                                    {task.status || "Pending"}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full capitalize ${getTaskTypeColor(task.taskType)}`}>
                                    {task.taskType || "Task"}
                                </span>
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
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">SKU Code</p>
                                    <p className="text-sm sm:text-base font-mono font-medium text-gray-800 dark:text-white">
                                        {getSkuCode()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Product Name</p>
                                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                        {getSkuName()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
                                    <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                                        {task.qty} units
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                        {getWeight()}
                                    </p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Dimensions</p>
                                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                        {getDimensions()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Information Card */}
                    {(task.sourceBin || task.destinationBin || task.suggestedBin) && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                            <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                    <FaMapMarker className="text-amber-500" /> Location Information
                                </h3>
                            </div>
                            <div className="p-4 sm:p-5">
                                <div className="space-y-3">
                                    {task.sourceBin && (
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pb-2 border-b dark:border-slate-700">
                                            <span className="text-sm text-gray-500">Source Bin:</span>
                                            <span className="font-mono text-sm font-semibold text-gray-800 dark:text-white">
                                                {task.sourceBin?.code || "N/A"}
                                            </span>
                                        </div>
                                    )}
                                    {task.destinationBin && (
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 pb-2 border-b dark:border-slate-700">
                                            <span className="text-sm text-gray-500">Destination Bin:</span>
                                            <span className="font-mono text-sm font-semibold text-gray-800 dark:text-white">
                                                {task.destinationBin?.code || "N/A"}
                                            </span>
                                        </div>
                                    )}
                                    {task.suggestedBin && (
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                            <span className="text-sm text-gray-500">Suggested Bin:</span>
                                            <span className="font-mono text-sm font-semibold text-green-600 dark:text-green-400">
                                                {task.suggestedBin?.code || "N/A"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}



                    {hasAssignedWorker && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                            <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                    <FaUser className="text-amber-500" /> Assigned Worker
                                </h3>
                            </div>
                            <div className="p-4 sm:p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center font-semibold">
                                        {getAssignedWorkerInitial()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white">
                                            {getAssignedWorkerName()}
                                        </p>
                                        {getAssignedWorkerEmail() && (
                                            <p className="text-xs text-gray-500">
                                                {getAssignedWorkerEmail()}
                                            </p>
                                        )}
                                    </div>
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
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <div className="flex items-center gap-2">
                                        <FaCalendar className="text-gray-400 text-sm" />
                                        <span className="text-sm text-gray-500">Created:</span>
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {task.createdAt ? new Date(task.createdAt).toLocaleString() : "N/A"}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                    <div className="flex items-center gap-2">
                                        <FaCalendar className="text-gray-400 text-sm" />
                                        <span className="text-sm text-gray-500">Last Updated:</span>
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        {task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "N/A"}
                                    </span>
                                </div>
                                {task.completedAt && (
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                        <div className="flex items-center gap-2">
                                            <FaCheckCircle className="text-green-500 text-sm" />
                                            <span className="text-sm text-gray-500">Completed:</span>
                                        </div>
                                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                            {new Date(task.completedAt).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

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


export default TaskDetailsModal;