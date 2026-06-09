
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
    FaSearch,
    FaFilter,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaStar,
    FaTrophy,
} from "react-icons/fa";
import toast from "react-hot-toast";

function WorkerTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userData);
        fetchMyTasks();
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        setItemsPerPage(mobile ? 3 : 5);
        setCurrentPage(1);
    };

    const fetchMyTasks = async () => {
        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
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
            toast.success("Task completed successfully! 🎉");
            fetchMyTasks();
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to complete task");
        }
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            1: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
            2: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
            3: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
            4: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            5: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        };
        return badges[priority] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
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
            pick: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
            pack: "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20",
            ship: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
            putaway: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20",
            receive: "border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-900/20",
            move: "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20",
        };
        return colors[type] || "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50";
    };

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const matchesFilter = filter === "all" ? true : filter === "pending" ? task.status !== "completed" : task.status === "completed";
        const matchesSearch = searchTerm === "" ||
            task.sku?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.sku?.skuCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.taskType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.sourceBin?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.destinationBin?.code?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Pagination
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const paginatedTasks = filteredTasks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status !== "completed").length,
        completed: tasks.filter(t => t.status === "completed").length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === "completed").length / tasks.length) * 100) : 0,
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
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                    {/* Header - Responsive */}
                    <div className="mb-6 md:mb-8">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                            My Tasks
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                            View and complete tasks assigned to you
                        </p>
                    </div>

                    {/* Stats Cards - Responsive Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Tasks</p>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</h2>
                                </div>
                                <FaTasks className="text-blue-500 text-2xl sm:text-3xl" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</h2>
                                </div>
                                <FaClock className="text-yellow-500 text-2xl sm:text-3xl" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</h2>
                                </div>
                                <FaCheckCircle className="text-green-500 text-2xl sm:text-3xl" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Completion Rate</p>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.completionRate}%</h2>
                                </div>
                                <FaStar className="text-purple-500 text-2xl sm:text-3xl" />
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter - Responsive */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="text"
                                placeholder="Search by product, SKU, or location..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border dark:border-slate-700 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white transition"
                            />
                        </div>

                        {/* Desktop Filters */}
                        <div className="hidden sm:flex gap-2">
                            <button
                                onClick={() => {
                                    setFilter("all");
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-xl transition text-sm font-medium ${filter === "all"
                                    ? "bg-amber-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300"
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => {
                                    setFilter("pending");
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-xl transition text-sm font-medium ${filter === "pending"
                                    ? "bg-yellow-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300"
                                    }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => {
                                    setFilter("completed");
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-xl transition text-sm font-medium ${filter === "completed"
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300"
                                    }`}
                            >
                                Completed
                            </button>
                        </div>

                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="sm:hidden flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-800 border rounded-xl px-4 py-2"
                        >
                            <FaFilter />
                            <span>Filter</span>
                            {filter !== "all" && (
                                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    1
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Mobile Filter Modal */}
                    {showMobileFilters && isMobile && (
                        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm">
                                <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
                                    <h3 className="font-semibold text-lg">Filter Tasks</h3>
                                    <button onClick={() => setShowMobileFilters(false)} className="p-1">
                                        <FaTimes />
                                    </button>
                                </div>
                                <div className="p-4 space-y-3">
                                    <button
                                        onClick={() => {
                                            setFilter("all");
                                            setCurrentPage(1);
                                            setShowMobileFilters(false);
                                        }}
                                        className={`w-full px-4 py-2 rounded-xl transition text-left ${filter === "all"
                                            ? "bg-amber-500 text-white"
                                            : "bg-gray-100 text-gray-600 dark:bg-slate-700"
                                            }`}
                                    >
                                        All Tasks
                                    </button>
                                    <button
                                        onClick={() => {
                                            setFilter("pending");
                                            setCurrentPage(1);
                                            setShowMobileFilters(false);
                                        }}
                                        className={`w-full px-4 py-2 rounded-xl transition text-left ${filter === "pending"
                                            ? "bg-yellow-500 text-white"
                                            : "bg-gray-100 text-gray-600 dark:bg-slate-700"
                                            }`}
                                    >
                                        Pending
                                    </button>
                                    <button
                                        onClick={() => {
                                            setFilter("completed");
                                            setCurrentPage(1);
                                            setShowMobileFilters(false);
                                        }}
                                        className={`w-full px-4 py-2 rounded-xl transition text-left ${filter === "completed"
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-100 text-gray-600 dark:bg-slate-700"
                                            }`}
                                    >
                                        Completed
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tasks List */}
                    {filteredTasks.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-8 sm:p-12 text-center">
                            {stats.completed > 0 && filter === "pending" ? (
                                <>
                                    <FaTrophy className="text-5xl text-yellow-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">All Caught Up!</h3>
                                    <p className="text-gray-400">You have no pending tasks. Great job! 🎉</p>
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Tasks Found</h3>
                                    <p className="text-gray-400">
                                        {filter === "pending"
                                            ? "You have no pending tasks"
                                            : filter === "completed"
                                                ? "You haven't completed any tasks yet"
                                                : "No tasks assigned to you yet"}
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 sm:space-y-4">
                                {paginatedTasks.map((task) => (
                                    <div
                                        key={task._id}
                                        className={`bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border-l-4 sm:border-l-8 ${getTaskTypeColor(task.taskType)} p-3 sm:p-5 shadow-sm hover:shadow-md transition`}
                                    >
                                        <div className="flex flex-col gap-3 sm:gap-4">
                                            {/* Header */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <span className="text-xl sm:text-2xl">{getTaskTypeIcon(task.taskType)}</span>
                                                    <div>
                                                        <h3 className="font-semibold text-base sm:text-lg capitalize text-gray-800 dark:text-white">
                                                            {task.taskType} Task
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${task.status === "completed"
                                                                ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                                                                : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                                                                }`}>
                                                                {task.status === "completed" ? "✅ Completed" : "⏳ Pending"}
                                                            </span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadge(task.priority)}`}>
                                                                {getPriorityLabel(task.priority)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                {task.status !== "completed" && (
                                                    <button
                                                        onClick={() => handleCompleteTask(task._id)}
                                                        className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition transform hover:scale-105 text-sm sm:text-base"
                                                    >
                                                        <FaCheckCircle className="text-sm" />
                                                        Complete Task
                                                    </button>
                                                )}

                                                {task.status === "completed" && (
                                                    <div className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl flex items-center gap-2 text-sm">
                                                        <FaUserCheck />
                                                        <span>Task Completed</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">SKU Code</p>
                                                    <p className="font-mono text-sm font-medium text-gray-800 dark:text-white">
                                                        {task.sku?.skuCode || "N/A"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Product Name</p>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                                                        {task.sku?.name || "N/A"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
                                                    <p className="text-base sm:text-lg font-semibold text-amber-600 dark:text-amber-400">
                                                        {task.qty} units
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Location Info */}
                                            {(task.sourceBin || task.destinationBin) && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t dark:border-slate-700">
                                                    {task.sourceBin && (
                                                        <div className="flex items-center gap-2">
                                                            <FaMapMarkerAlt className="text-gray-400 text-sm" />
                                                            <div>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Pick Location</p>
                                                                <p className="font-mono text-sm font-medium text-gray-800 dark:text-white">
                                                                    {task.sourceBin?.code}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {task.destinationBin && (
                                                        <div className="flex items-center gap-2">
                                                            <FaMapMarkerAlt className="text-gray-400 text-sm" />
                                                            <div>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">Drop Location</p>
                                                                <p className="font-mono text-sm font-medium text-gray-800 dark:text-white">
                                                                    {task.destinationBin?.code}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Order Info */}
                                            {task.order && (
                                                <div className="pt-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Related Order</p>
                                                    <p className="font-mono text-sm text-gray-800 dark:text-white">
                                                        {task.order?.orderNumber}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Completion Date */}
                                            {task.completedAt && (
                                                <div className="pt-2 border-t dark:border-slate-700">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed On</p>
                                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                        {new Date(task.completedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t dark:border-slate-700">
                                    <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                                        Showing {paginatedTasks.length} of {filteredTasks.length} tasks
                                    </div>
                                    <div className="flex items-center gap-2 order-1 sm:order-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                                        >
                                            <FaChevronLeft className="inline mr-1" size={12} /> Prev
                                        </button>
                                        <span className="text-xs sm:text-sm">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                                        >
                                            Next <FaChevronRight className="inline ml-1" size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Refresh Button */}
                    <div className="mt-6 sm:mt-8 text-center">
                        <button
                            onClick={fetchMyTasks}
                            className="text-amber-500 hover:text-amber-600 flex items-center gap-2 mx-auto text-sm sm:text-base"
                        >
                            <FaTasks />
                            Refresh Tasks
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default WorkerTasks;