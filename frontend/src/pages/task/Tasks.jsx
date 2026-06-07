
// pages/Tasks.jsx - Updated version with all task types

import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import TaskDetailsModal from "../../components/tasks/TaskDetailsModal";
import AssignWorkerModal from "../../components/tasks/AssignWorkerModal";
import {
    FaClipboardList,
    FaBoxOpen,
    FaBox,
    FaTruck,
    FaUserCheck,
    FaClock,
    FaCheckCircle,
    FaWarehouse,  // Add this for putaway
} from "react-icons/fa";
import toast from "react-hot-toast";

function Tasks() {
    const [tasks, setTasks] = useState({
        pick: [],
        pack: [],
        ship: [],
        putaway: [],
    });
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const [openAssignModal, setOpenAssignModal] = useState(false);

    const fetchAllTasks = async () => {
        try {
            setLoading(true);

            // Fetch all task types
            const [pickRes, packRes, shipRes, putawayRes] = await Promise.all([
                api.get("/tasks/pick-tasks"),
                api.get("/tasks/pack-tasks"),
                api.get("/tasks/ship-tasks"),
                api.get("/receipts/putaway/tasks"),
            ]);

            setTasks({
                pick: pickRes.data.data || [],
                pack: packRes.data.data || [],
                ship: shipRes.data.data || [],
                putaway: putawayRes.data.data || [],
            });
        } catch (error) {
            console.error("Error fetching tasks:", error);
            toast.error("Failed to fetch tasks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllTasks();
    }, []);

    const handleCompletePutaway = async (taskId) => {
        try {
            await api.put(`/receipts/putaway/complete/${taskId}`);
            toast.success("Putaway completed!");
            fetchAllTasks();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to complete putaway");
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            1: "bg-red-100 text-red-600",
            2: "bg-orange-100 text-orange-600",
            3: "bg-yellow-100 text-yellow-600",
            4: "bg-blue-100 text-blue-600",
            5: "bg-green-100 text-green-600",
        };
        return colors[priority] || "bg-gray-100 text-gray-600";
    };

    const TaskColumn = ({ title, icon, tasks, type, onComplete, bgColor }) => (
        <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 min-h-[500px]">
            <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl ${bgColor}`}>
                {icon}
                <h2 className="text-lg font-semibold">{title}</h2>
                <span className="ml-auto bg-white dark:bg-slate-700 px-2 py-1 rounded-full text-sm">
                    {tasks.length}
                </span>
            </div>

            <div className="space-y-3">
                {tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <FaClipboardList className="mx-auto text-3xl mb-2" />
                        <p className="text-sm">No pending tasks</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task._id}
                            className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                            onClick={() => {
                                setSelectedTask(task);
                                setOpenDetailsModal(true);
                            }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                                    Priority {task.priority || 2}
                                </span>
                                <span className="text-xs text-gray-500 capitalize">
                                    {task.taskType}
                                </span>
                            </div>

                            <h3 className="font-semibold text-sm mb-1">
                                {task.sku?.name || task.inventory?.sku?.name || "SKU Name"}
                            </h3>

                            <p className="text-xs text-gray-500 mb-3">
                                Qty: {task.qty} units
                            </p>

                            {task.sourceBin && (
                                <p className="text-xs text-gray-500 mb-2">
                                    📍 Source Bin: {task.sourceBin?.code}
                                </p>
                            )}

                            {task.destinationBin && (
                                <p className="text-xs text-gray-500 mb-2">
                                    🎯 Destination Bin: {task.destinationBin?.code}
                                </p>
                            )}

                            {task.suggestedBin && (
                                <p className="text-xs text-green-600 mb-2">
                                    💡 Suggested Bin: {task.suggestedBin?.code}
                                </p>
                            )}

                            {task.assignedTo && (
                                <p className="text-xs text-green-600 mb-3">
                                    👤 Assigned to: {task.assignedTo?.name}
                                </p>
                            )}

                            <div className="flex gap-2 mt-3">
                                {!task.assignedTo && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTask(task);
                                            setOpenAssignModal(true);
                                        }}
                                        className="flex-1 text-sm bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                                    >
                                        Assign
                                    </button>
                                )}

                                {task.assignedTo && task.status !== "completed" && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (type === "putaway") onComplete(task._id);
                                            else if (type === "pick") onComplete(task._id);
                                            else if (type === "pack") onComplete(task._id);
                                            else if (type === "ship") onComplete(task._id);
                                        }}
                                        className="flex-1 text-sm bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                                    >
                                        Complete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const stats = {
        total: tasks.pick.length + tasks.pack.length + tasks.ship.length + tasks.putaway.length,
        pick: tasks.pick.length,
        pack: tasks.pack.length,
        ship: tasks.ship.length,
        putaway: tasks.putaway.length,
    };

    return (
        <DashboardLayout>
            <div className="p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                            Task Management
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Manage warehouse tasks - Putaway, Pick, Pack, and Ship
                        </p>
                    </div>
                    <button
                        onClick={fetchAllTasks}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition"
                    >
                        <FaClipboardList /> Refresh Tasks
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <p className="text-gray-500 text-sm">Total Tasks</p>
                        <h2 className="text-2xl font-bold">{stats.total}</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <p className="text-gray-500 text-sm">Putaway Tasks</p>
                        <h2 className="text-2xl font-bold text-teal-600">{stats.putaway}</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <p className="text-gray-500 text-sm">Pick Tasks</p>
                        <h2 className="text-2xl font-bold text-blue-600">{stats.pick}</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <p className="text-gray-500 text-sm">Pack/Ship Tasks</p>
                        <h2 className="text-2xl font-bold text-purple-600">{stats.pack + stats.ship}</h2>
                    </div>
                </div>

                {/* Kanban Board - 4 columns now */}
                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <TaskColumn
                            title="Putaway Tasks"
                            icon={<FaWarehouse className="text-teal-600 text-xl" />}
                            tasks={tasks.putaway}
                            type="putaway"
                            onComplete={handleCompletePutaway}
                            bgColor="bg-teal-50 dark:bg-teal-900/20"
                        />
                        <TaskColumn
                            title="Pick Tasks"
                            icon={<FaBoxOpen className="text-blue-600 text-xl" />}
                            tasks={tasks.pick}
                            type="pick"
                            onComplete={() => { }}
                            bgColor="bg-blue-50 dark:bg-blue-900/20"
                        />
                        <TaskColumn
                            title="Pack Tasks"
                            icon={<FaBox className="text-purple-600 text-xl" />}
                            tasks={tasks.pack}
                            type="pack"
                            onComplete={() => { }}
                            bgColor="bg-purple-50 dark:bg-purple-900/20"
                        />
                        <TaskColumn
                            title="Ship Tasks"
                            icon={<FaTruck className="text-green-600 text-xl" />}
                            tasks={tasks.ship}
                            type="ship"
                            onComplete={() => { }}
                            bgColor="bg-green-50 dark:bg-green-900/20"
                        />
                    </div>
                )}
            </div>

            {/* Modals */}
            <TaskDetailsModal
                open={openDetailsModal}
                onClose={() => setOpenDetailsModal(false)}
                task={selectedTask}
            />

            <AssignWorkerModal
                open={openAssignModal}
                onClose={() => setOpenAssignModal(false)}
                task={selectedTask}
                onAssign={fetchAllTasks}
            />
        </DashboardLayout>
    );
}

export default Tasks;