
import { FaTimes, FaBox, FaUser, FaMapMarker, FaCalendar, FaClock } from "react-icons/fa";

function TaskDetailsModal({ open, onClose, task }) {
    if (!open || !task) return null;

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-gray-100 text-gray-600",
            assigned: "bg-blue-100 text-blue-600",
            in_progress: "bg-yellow-100 text-yellow-600",
            completed: "bg-green-100 text-green-600",
            cancelled: "bg-red-100 text-red-600",
        };
        return colors[status] || "bg-gray-100 text-gray-600";
    };

    const getTaskTypeIcon = (type) => {
        const icons = {
            pick: "📦",
            pack: "📦",
            ship: "🚚",
            putaway: "📥",
            receive: "📋",
            move: "🔄",
        };
        return icons[type] || "📋";
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Task Details</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Task Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500">Task ID</p>
                            <p className="font-mono text-sm">{task._id}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                                {task.status}
                            </span>
                        </div>
                    </div>

                    {/* Task Type */}
                    <div className="border-t pt-4">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">{getTaskTypeIcon(task.taskType)}</span>
                            <div>
                                <p className="text-sm text-gray-500">Task Type</p>
                                <p className="text-xl font-semibold capitalize">{task.taskType}</p>
                            </div>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="border-t pt-4">
                        <p className="text-sm text-gray-500 mb-2">Priority</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-red-500 rounded-full h-2"
                                    style={{ width: `${(task.priority / 5) * 100}%` }}
                                />
                            </div>
                            <span className="font-semibold">Level {task.priority}/5</span>
                        </div>
                    </div>

                    {/* SKU Details */}
                    {task.sku || task.inventory?.sku && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <FaBox /> Product Details
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-sm text-gray-500">SKU Code</p>
                                    <p className="font-mono">{task.inventory?.sku?.skuCode || task.sku?.skuCode}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Product Name</p>
                                    <p>{task.inventory?.sku?.name || task.sku?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Quantity</p>
                                    <p className="font-semibold">{task.qty} units</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Weight</p>
                                    <p>{task.inventory?.sku?.weight || task.sku?.weight} kg</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Location Details */}
                    {(task.sourceBin || task.destinationBin) && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <FaMapMarker /> Location
                            </h3>
                            {task.sourceBin && (
                                <div className="mb-2">
                                    <p className="text-sm text-gray-500">Source Bin</p>
                                    <p className="font-mono">{task.sourceBin?.code}</p>
                                </div>
                            )}
                            {task.destinationBin && (
                                <div>
                                    <p className="text-sm text-gray-500">Destination Bin</p>
                                    <p className="font-mono">{task.destinationBin?.code}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Assigned Worker */}
                    {task.assignedTo && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <FaUser /> Assigned Worker
                            </h3>
                            <p>{task.assignedTo?.name}</p>
                        </div>
                    )}

                    {/* Order Details */}
                    {task.order && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">Order Information</h3>
                            <p className="font-mono text-sm">Order #: {task.order?.orderNumber}</p>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <FaCalendar /> Timeline
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created:</span>
                                <span>{new Date(task.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Last Updated:</span>
                                <span>{new Date(task.updatedAt).toLocaleString()}</span>
                            </div>
                            {task.completedAt && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Completed:</span>
                                    <span className="text-green-600">{new Date(task.completedAt).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t p-6 flex justify-end">
                    <button onClick={onClose} className="px-5 py-3 border rounded-xl hover:bg-gray-50">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TaskDetailsModal;