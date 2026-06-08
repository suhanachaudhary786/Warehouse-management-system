
import { useState, useEffect } from "react";
import api from "../../api/api";
import { FaTimes, FaUserCheck } from "react-icons/fa";
import toast from "react-hot-toast";

function AssignWorkerModal({ open, onClose, task, onAssign }) {
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchWorkers();
        }
    }, [open]);

    const fetchWorkers = async () => {
        try {
            const res = await api.get("/workers");
            console.log("Fetched workers:", res.data.data);
            setWorkers(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch workers");
        }
    };

    const handleAssign = async () => {
        if (!selectedWorker) {
            toast.error("Please select a worker");
            return;
        }

        setLoading(true);
        try {
            // Find the selected worker to get userId
            const worker = workers.find(w => w._id === selectedWorker);

            console.log("Selected Worker:", worker);
            console.log("Worker User ID:", worker?.userId);
            console.log("Task ID:", task?._id);

            if (!worker || !worker.userId) {
                toast.error("Worker has no associated user account. Please recreate this worker.");
                return;
            }

            // ✅ Send worker.userId (NOT worker._id)
            const response = await api.put(`/tasks/accept/${task._id}`, {
                assignedWorker: worker.userId
            });

            console.log("Assignment response:", response.data);

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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Assign Task</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Task Type</p>
                        <p className="font-semibold capitalize">{task?.taskType}</p>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">SKU</p>
                        <p>{task?.sku?.name || task?.inventory?.sku?.name}</p>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Quantity</p>
                        <p>{task?.qty} units</p>
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 font-medium">Select Worker</label>
                        <select
                            value={selectedWorker}
                            onChange={(e) => setSelectedWorker(e.target.value)}
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="">Choose a worker...</option>
                            {workers.map((worker) => (
                                <option key={worker._id} value={worker._id}>
                                    {worker.name} - {worker.skills?.join(", ")}
                                    {worker.userId ? " ✅" : " ⚠️ No Login"}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Note: Worker must have "✅" to login
                        </p>
                    </div>
                </div>

                <div className="border-t p-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-3 border rounded-xl hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={loading}
                        className="px-5 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
                    >
                        <FaUserCheck />
                        {loading ? "Assigning..." : "Assign Task"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AssignWorkerModal;