
import { useState, useEffect } from "react";
import api from "../../api/api";
import { FaTimes, FaUserCheck, FaUser, FaTools, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import toast from "react-hot-toast";

function AssignWorkerModal({ open, onClose, task, onAssign }) {
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedWorkerDetails, setSelectedWorkerDetails] = useState(null);

    useEffect(() => {
        if (open) {
            fetchWorkers();
            setSelectedWorker("");
            setSelectedWorkerDetails(null);
        }
    }, [open]);

    const fetchWorkers = async () => {
        try {
            const res = await api.get("/workers");
            setWorkers(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch workers");
        }
    };

    const handleWorkerSelect = (workerId) => {
        setSelectedWorker(workerId);
        const worker = workers.find(w => w._id === workerId);
        setSelectedWorkerDetails(worker);
    };

    const handleAssign = async () => {
        if (!selectedWorker) {
            toast.error("Please select a worker");
            return;
        }

        setLoading(true);
        try {
            const worker = workers.find(w => w._id === selectedWorker);

            if (!worker || !worker.userId) {
                toast.error("Worker has no associated user account. Please recreate this worker.");
                return;
            }

            await api.put(`/tasks/accept/${task._id}`, {
                assignedWorker: worker.userId
            });

            toast.success(`Task assigned to ${worker.name}`);
            onAssign();
            onClose();
        } catch (error) {
            console.error("Assignment error:", error);
            toast.error(error?.response?.data?.message || "Failed to assign task");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    // Check if task has location info
    const hasLocation = task?.sourceBin || task?.destinationBin || task?.suggestedBin;

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
                            Assign Task
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Assign task to warehouse worker
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
                    {/* Task Summary Card */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-xl p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Task to Assign</p>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                                <span className="font-semibold capitalize text-gray-800 dark:text-white">
                                    {task?.taskType || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">SKU:</span>
                                <span className="font-medium text-sm text-gray-800 dark:text-white">
                                    {task?.sku?.name || task?.inventory?.sku?.name || "N/A"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Quantity:</span>
                                <span className="font-semibold text-amber-600 dark:text-amber-400">
                                    {task?.qty} units
                                </span>
                            </div>
                            {task?.priority && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Priority:</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === 1 ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400" :
                                            task.priority === 2 ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" :
                                                task.priority === 3 ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400" :
                                                    "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                                        }`}>
                                        Priority {task.priority}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location Info (if available) */}
                    {hasLocation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
                            <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">📍 Location Info</p>
                            <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                                {task?.sourceBin && (
                                    <p>From: <span className="font-mono">{task.sourceBin?.code}</span></p>
                                )}
                                {task?.destinationBin && (
                                    <p>To: <span className="font-mono">{task.destinationBin?.code}</span></p>
                                )}
                                {task?.suggestedBin && (
                                    <p>Suggested: <span className="font-mono">{task.suggestedBin?.code}</span></p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Worker Selection */}
                    <div className="group">
                        <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                            Select Worker <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <select
                                value={selectedWorker}
                                onChange={(e) => handleWorkerSelect(e.target.value)}
                                className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                            >
                                <option value="">Choose a worker...</option>
                                {workers.map((worker) => (
                                    <option key={worker._id} value={worker._id}>
                                        {worker.name} - {worker.skills?.slice(0, 2).join(", ")}
                                        {worker.userId ? " ✓" : " ⚠️"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selected Worker Details */}
                        {selectedWorkerDetails && (
                            <div className="mt-2 p-2 sm:p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                    <div>
                                        <span className="text-gray-500">Name:</span>
                                        <p className="font-medium">{selectedWorkerDetails.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Skills:</span>
                                        <p className="text-xs">{selectedWorkerDetails.skills?.join(", ") || "N/A"}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2 mt-1">
                                            {selectedWorkerDetails.userId ? (
                                                <>
                                                    <FaCheckCircle className="text-green-500 text-xs" />
                                                    <span className="text-xs text-green-600 dark:text-green-400">
                                                        Has login access
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaExclamationTriangle className="text-yellow-500 text-xs" />
                                                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                                                        No login access - Cannot assign
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Worker Stats */}
                    {workers.length > 0 && (
                        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                Available Workers: {workers.length}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-green-600 dark:text-green-400">
                                    ✅ With Login: {workers.filter(w => w.userId).length}
                                </span>
                                <span className="text-xs text-yellow-600 dark:text-yellow-400">
                                    ⚠️ No Login: {workers.filter(w => !w.userId).length}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Warning Message */}
                    {selectedWorkerDetails && !selectedWorkerDetails.userId && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 border border-red-200 dark:border-red-800">
                            <div className="flex items-start gap-2">
                                <FaExclamationTriangle className="text-red-500 text-sm mt-0.5" />
                                <div>
                                    <p className="text-xs font-semibold text-red-800 dark:text-red-200">
                                        Cannot Assign Task
                                    </p>
                                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                                        This worker doesn't have a user account. Please recreate the worker with proper credentials.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Info Message */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-2">
                            <FaInfoCircle className="text-blue-500 text-sm mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                                    Assignment Info
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    Task will be assigned to selected worker. Worker will be notified and can start working on it immediately.
                                </p>
                            </div>
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
                        onClick={handleAssign}
                        disabled={loading || !selectedWorker || (selectedWorkerDetails && !selectedWorkerDetails.userId)}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2 text-sm sm:text-base"
                    >
                        {loading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        <FaUserCheck className="text-sm" />
                        {loading ? "Assigning..." : "Assign Task"}
                    </button>
                </div>
            </div>
        </div>
    );
}


export default AssignWorkerModal;