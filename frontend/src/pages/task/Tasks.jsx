
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
    FaWarehouse,
    FaUser,
    FaCalendar,
    FaExclamationTriangle,
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
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        fetchAllTasks();
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
    };

    const fetchAllTasks = async () => {
        try {
            setLoading(true);

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

    const handleCompleteTask = async (taskId, type) => {
        try {
            if (type === "putaway") {
                await api.put(`/receipts/putaway/complete/${taskId}`);
            } else {
                await api.put(`/tasks/${taskId}/complete`);
            }
            toast.success("Task completed successfully");
            fetchAllTasks();
        } catch (error) {
            console.error(error);
            // toast.error("Failed to complete task");
        }
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

    const TaskColumn = ({ title, icon, tasks, type, bgColor }) => (
        <div className={`bg-gray-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 min-h-[400px] sm:min-h-[500px] flex flex-col ${bgColor}`}>
            {/* Column Header */}
            <div className={`flex items-center gap-2 mb-3 sm:mb-4 p-2 sm:p-3 rounded-xl ${bgColor} sticky top-0 z-10`}>
                <div className="flex items-center gap-2">
                    {icon}
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
                </div>
                <span className="ml-auto bg-white dark:bg-slate-700 px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
                    {tasks.length}
                </span>
            </div>

            {/* Tasks List */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
                {tasks.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-gray-400">
                        <FaClipboardList className="mx-auto text-2xl sm:text-3xl mb-2" />
                        <p className="text-xs sm:text-sm">No pending tasks</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task._id}
                            className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
                            onClick={() => {
                                setSelectedTask(task);
                                setOpenDetailsModal(true);
                            }}
                        >
                            {/* Task Header */}
                            <div className="flex justify-between items-start mb-2 gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                                    {getPriorityLabel(task.priority)}
                                </span>
                                <span className="text-xs text-gray-500 capitalize bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                    {task.taskType || type}
                                </span>
                            </div>

                            {/* Task Title */}
                            <h3 className="font-semibold text-sm sm:text-base mb-1 text-gray-800 dark:text-white line-clamp-2">
                                {task.sku?.name || task.inventory?.sku?.name || "Task Item"}
                            </h3>

                            {/* Quantity */}
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Quantity: <span className="font-semibold">{task.qty}</span> units
                            </p>

                            {/* Location Info */}
                            {task.sourceBin && (
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                    <span>From:</span>
                                    <span className="font-mono">{task.sourceBin?.code}</span>
                                </p>
                            )}
                            {task.destinationBin && (
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                    <span>To:</span>
                                    <span className="font-mono">{task.destinationBin?.code}</span>
                                </p>
                            )}
                            {task.suggestedBin && (
                                <p className="text-xs text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
                                    <span>Suggested:</span>
                                    <span className="font-mono">{task.suggestedBin?.code}</span>
                                </p>
                            )}

                            {/* Assigned To */}
                            {task.assignedTo && (
                                <div className="flex items-center gap-1 mt-2 mb-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                                    <FaUserCheck className="text-xs" />
                                    <span>Assigned to: {task.assignedTo?.name}</span>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-3">
                                {!task.assignedTo ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTask(task);
                                            setOpenAssignModal(true);
                                        }}
                                        className="flex-1 text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
                                    >
                                        Assign Task
                                    </button>
                                ) : task.status !== "completed" && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCompleteTask(task._id, type);
                                        }}
                                        className="flex-1 text-xs sm:text-sm bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition flex items-center justify-center gap-1"
                                    >
                                        <FaCheckCircle className="text-xs" /> Complete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    // Mobile Horizontal Scroll View
    const MobileTaskView = () => (
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-4 min-w-max">
                <div className="w-[85vw] max-w-[320px]">
                    <TaskColumn
                        title="Putaway"
                        icon={<FaWarehouse className="text-teal-600 text-xl" />}
                        tasks={tasks.putaway}
                        type="putaway"
                        bgColor="bg-teal-50 dark:bg-teal-900/20"
                    />
                </div>
                <div className="w-[85vw] max-w-[320px]">
                    <TaskColumn
                        title="Pick"
                        icon={<FaBoxOpen className="text-blue-600 text-xl" />}
                        tasks={tasks.pick}
                        type="pick"
                        bgColor="bg-blue-50 dark:bg-blue-900/20"
                    />
                </div>
                <div className="w-[85vw] max-w-[320px]">
                    <TaskColumn
                        title="Pack"
                        icon={<FaBox className="text-purple-600 text-xl" />}
                        tasks={tasks.pack}
                        type="pack"
                        bgColor="bg-purple-50 dark:bg-purple-900/20"
                    />
                </div>
                <div className="w-[85vw] max-w-[320px]">
                    <TaskColumn
                        title="Ship"
                        icon={<FaTruck className="text-green-600 text-xl" />}
                        tasks={tasks.ship}
                        type="ship"
                        bgColor="bg-green-50 dark:bg-green-900/20"
                    />
                </div>
            </div>
        </div>
    );

    const stats = {
        total: tasks.pick.length + tasks.pack.length + tasks.ship.length + tasks.putaway.length,
        pick: tasks.pick.length,
        pack: tasks.pack.length,
        ship: tasks.ship.length,
        putaway: tasks.putaway.length,
        assigned: Object.values(tasks).flat().filter(t => t.assignedTo).length,
        unassigned: Object.values(tasks).flat().filter(t => !t.assignedTo).length,
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                    {/* Header - Responsive */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                                Task Management
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                                Manage warehouse tasks - Putaway, Pick, Pack, and Ship
                            </p>
                        </div>
                        <button
                            onClick={fetchAllTasks}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl flex items-center gap-2 transition shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
                        >
                            <FaClipboardList className="text-sm sm:text-base" />
                            <span>Refresh Tasks</span>
                        </button>
                    </div>

                    {/* Stats Cards - Responsive Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 md:mb-8">
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Tasks</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</h2>
                                </div>
                                <FaClipboardList className="text-amber-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Putaway</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-teal-600">{stats.putaway}</h2>
                                </div>
                                <FaWarehouse className="text-teal-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Pick</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-blue-600">{stats.pick}</h2>
                                </div>
                                <FaBoxOpen className="text-blue-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Pack</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-purple-600">{stats.pack}</h2>
                                </div>
                                <FaBox className="text-purple-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Ship</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-green-600">{stats.ship}</h2>
                                </div>
                                <FaTruck className="text-green-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Assigned</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-indigo-600">{stats.assigned}</h2>
                                </div>
                                <FaUserCheck className="text-indigo-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex justify-center items-center h-96">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Horizontal Scroll View */}
                            {isMobile && <MobileTaskView />}

                            {/* Desktop Grid View */}
                            {!isMobile && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                    <TaskColumn
                                        title="Putaway Tasks"
                                        icon={<FaWarehouse className="text-teal-600 text-xl" />}
                                        tasks={tasks.putaway}
                                        type="putaway"
                                        bgColor="bg-teal-50 dark:bg-teal-900/20"
                                    />
                                    <TaskColumn
                                        title="Pick Tasks"
                                        icon={<FaBoxOpen className="text-blue-600 text-xl" />}
                                        tasks={tasks.pick}
                                        type="pick"
                                        bgColor="bg-blue-50 dark:bg-blue-900/20"
                                    />
                                    <TaskColumn
                                        title="Pack Tasks"
                                        icon={<FaBox className="text-purple-600 text-xl" />}
                                        tasks={tasks.pack}
                                        type="pack"
                                        bgColor="bg-purple-50 dark:bg-purple-900/20"
                                    />
                                    <TaskColumn
                                        title="Ship Tasks"
                                        icon={<FaTruck className="text-green-600 text-xl" />}
                                        tasks={tasks.ship}
                                        type="ship"
                                        bgColor="bg-green-50 dark:bg-green-900/20"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {/* Quick Stats Footer */}
                    {!loading && stats.total > 0 && (
                        <div className="mt-6 pt-4 border-t dark:border-slate-700">
                            <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                    <span>Putaway: {stats.putaway}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Pick: {stats.pick}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>Pack: {stats.pack}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>Ship: {stats.ship}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                    <span>Assigned: {stats.assigned}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                    <span>Unassigned: {stats.unassigned}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <TaskDetailsModal
                open={openDetailsModal}
                onClose={() => setOpenDetailsModal(false)}
                task={selectedTask}
                refresh={fetchAllTasks}
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