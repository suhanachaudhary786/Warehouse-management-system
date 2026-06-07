
// pages/worker/WorkerTasks.jsx
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import {
    FaTasks,
    FaCheckCircle,
    FaClock,
    FaBoxOpen,
    FaMapMarkerAlt,
    FaUserCheck,
} from "react-icons/fa";
import toast from "react-hot-toast";

function WorkerTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [filter, setFilter] = useState("all"); // all, pending, completed

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userData);
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem("user") || "{}");

            // Fetch tasks assigned to this worker
            const res = await api.get(`/tasks/worker/${userData._id}`);
            setTasks(res.data.data || []);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            toast.error("Failed to fetch your tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteTask = async (taskId) => {
        try {
            await api.put(`/tasks/worker/complete/${taskId}`);
            toast.success("Task completed successfully!");
            fetchMyTasks(); // Refresh the list
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to complete task");
        }
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            1: "bg-red-100 text-red-600 border-red-200",
            2: "bg-orange-100 text-orange-600 border-orange-200",
            3: "bg-yellow-100 text-yellow-600 border-yellow-200",
            4: "bg-blue-100 text-blue-600 border-blue-200",
            5: "bg-green-100 text-green-600 border-green-200",
        };
        return badges[priority] || "bg-gray-100 text-gray-600";
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

    const getTaskTypeColor = (type) => {
        const colors = {
            pick: "border-blue-200 bg-blue-50",
            pack: "border-purple-200 bg-purple-50",
            ship: "border-green-200 bg-green-50",
            putaway: "border-yellow-200 bg-yellow-50",
            receive: "border-cyan-200 bg-cyan-50",
            move: "border-orange-200 bg-orange-50",
        };
        return colors[type] || "border-gray-200 bg-gray-50";
    };

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        if (filter === "pending") return task.status !== "completed";
        if (filter === "completed") return task.status === "completed";
        return true;
    });

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status !== "completed").length,
        completed: tasks.filter(t => t.status === "completed").length,
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-4 md:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                        My Tasks
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        View and complete tasks assigned to you
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 rounded-2xl p-6 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Tasks</p>
                                <h2 className="text-3xl font-bold text-blue-600">{stats.total}</h2>
                            </div>
                            <FaTasks className="text-blue-500 text-3xl" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 rounded-2xl p-6 border border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Pending</p>
                                <h2 className="text-3xl font-bold text-yellow-600">{stats.pending}</h2>
                            </div>
                            <FaClock className="text-yellow-500 text-3xl" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 rounded-2xl p-6 border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Completed</p>
                                <h2 className="text-3xl font-bold text-green-600">{stats.completed}</h2>
                            </div>
                            <FaCheckCircle className="text-green-500 text-3xl" />
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-xl transition ${filter === "all"
                            ? "bg-amber-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        All Tasks
                    </button>
                    <button
                        onClick={() => setFilter("pending")}
                        className={`px-4 py-2 rounded-xl transition ${filter === "pending"
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter("completed")}
                        className={`px-4 py-2 rounded-xl transition ${filter === "completed"
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        Completed
                    </button>
                </div>

                {/* Tasks List */}
                {filteredTasks.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-12 text-center">
                        <FaCheckCircle className="text-5xl text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Tasks Found</h3>
                        <p className="text-gray-400">
                            {filter === "pending"
                                ? "You have no pending tasks. Great job! 🎉"
                                : filter === "completed"
                                    ? "You haven't completed any tasks yet"
                                    : "No tasks assigned to you yet"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTasks.map((task) => (
                            <div
                                key={task._id}
                                className={`bg-white dark:bg-slate-800 rounded-2xl border-l-8 ${getTaskTypeColor(task.taskType)} p-5 shadow-sm hover:shadow-md transition`}
                                style={{ borderLeftColor: task.taskType === "pick" ? "#3b82f6" : task.taskType === "pack" ? "#8b5cf6" : "#10b981" }}
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    {/* Left - Task Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">{getTaskTypeIcon(task.taskType)}</span>
                                            <div>
                                                <h3 className="font-semibold text-lg capitalize">
                                                    {task.taskType} Task
                                                </h3>
                                                <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${task.status === "completed"
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-yellow-100 text-yellow-600"
                                                    }`}>
                                                    {task.status === "completed" ? "Completed ✅" : "Pending ⏳"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-500">SKU Code</p>
                                                <p className="font-mono text-sm font-medium">{task.sku?.skuCode || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Product Name</p>
                                                <p className="text-sm font-medium">{task.sku?.name || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Quantity</p>
                                                <p className="text-sm font-semibold">{task.qty} units</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                            {task.sourceBin && (
                                                <div className="flex items-center gap-2">
                                                    <FaMapMarkerAlt className="text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Pick Location</p>
                                                        <p className="font-mono text-sm">{task.sourceBin?.code}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {task.destinationBin && (
                                                <div className="flex items-center gap-2">
                                                    <FaMapMarkerAlt className="text-gray-400" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Drop Location</p>
                                                        <p className="font-mono text-sm">{task.destinationBin?.code}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {task.order && (
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-500">Related Order</p>
                                                <p className="font-mono text-sm">{task.order?.orderNumber}</p>
                                            </div>
                                        )}

                                        {task.completedAt && (
                                            <div className="mt-3">
                                                <p className="text-xs text-gray-500">Completed On</p>
                                                <p className="text-sm">{new Date(task.completedAt).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right - Action Button */}
                                    {task.status !== "completed" && (
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => handleCompleteTask(task._id)}
                                                className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition transform hover:scale-105"
                                            >
                                                <FaCheckCircle />
                                                Complete Task
                                            </button>
                                        </div>
                                    )}

                                    {task.status === "completed" && (
                                        <div className="flex items-center">
                                            <div className="bg-green-100 text-green-600 px-4 py-2 rounded-xl flex items-center gap-2">
                                                <FaUserCheck />
                                                <span>Task Completed</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Refresh Button */}
                <div className="mt-8 text-center">
                    <button
                        onClick={fetchMyTasks}
                        className="text-amber-500 hover:text-amber-600 flex items-center gap-2 mx-auto"
                    >
                        <FaTasks />
                        Refresh Tasks
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default WorkerTasks;