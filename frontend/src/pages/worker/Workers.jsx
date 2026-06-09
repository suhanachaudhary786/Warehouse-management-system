
import DashboardLayout from "../../layouts/DashboardLayout";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaUserCheck,
    FaSearch,
    FaFilter,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaEnvelope,
    FaTools,
    FaShieldAlt,
    FaWeightHanging,
    FaMapMarker,
    FaStar,
    FaUserCircle,
} from "react-icons/fa";
import AddWorkerModal from "../../components/workers/AddWorkerModal";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function Workers() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        offline: 0
    });
    const [editingWorker, setEditingWorker] = useState(null);

    const API_URL = "https://warehouse-management-system-backend-qro9.onrender.com/api/workers";

    // Fetch workers on component mount
    useEffect(() => {
        fetchWorkers();
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        setItemsPerPage(mobile ? 4 : 6);
        setCurrentPage(1);
    };

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const workersData = response.data.data;
            setWorkers(workersData);

            // Calculate stats
            const total = workersData.length;
            const available = workersData.filter(w => w.status === "available").length;
            const offline = workersData.filter(w => w.status === "offline").length;

            setStats({ total, available, offline });

        } catch (error) {
            console.error("Error fetching workers:", error);
            toast.error("Failed to fetch workers");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            await axios.delete(`${API_URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success(`${name} deleted successfully`);
            fetchWorkers();

        } catch (error) {
            console.error("Error deleting worker:", error);
            toast.error("Failed to delete worker");
        }
    };

    const handleEdit = (worker) => {
        setEditingWorker(worker);
        setIsModalOpen(true);
    };

    const handleWorkerCreated = (newWorker) => {
        toast.success(`${newWorker.name} created successfully`);
        fetchWorkers();
    };

    const handleWorkerUpdated = (updatedWorker) => {
        toast.success(`${updatedWorker.name} updated successfully`);
        fetchWorkers();
        setEditingWorker(null);
    };

    // Filter workers
    const filteredWorkers = workers.filter((worker) => {
        const matchesSearch =
            worker.name?.toLowerCase().includes(search.toLowerCase()) ||
            worker.email?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter ? worker.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredWorkers.length / itemsPerPage);
    const paginatedWorkers = filteredWorkers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusColor = (status) => {
        return status === "available"
            ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
            : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400";
    };

    const getStatusIcon = (status) => {
        return status === "available" ? "✅" : "⭕";
    };

    return (
        <>
            <DashboardLayout>
                <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                        {/* Header - Responsive */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                            <div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                                    Worker Master
                                </h1>
                                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                                    Manage warehouse workforce and assignments
                                </p>
                            </div>
                            <button
                                className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl flex items-center gap-2 transition shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
                                onClick={() => {
                                    setEditingWorker(null);
                                    setIsModalOpen(true);
                                }}
                            >
                                <FaPlus className="text-sm sm:text-base" />
                                <span>Add Worker</span>
                            </button>
                        </div>

                        {/* Stats Cards - Responsive Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 md:mb-8">
                            <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-4 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Workers</p>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">{stats.total}</h2>
                                    </div>
                                    <FaUserCheck className="text-amber-500 text-2xl sm:text-3xl" />
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-4 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Available</p>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-green-600">{stats.available}</h2>
                                    </div>
                                    <span className="text-2xl sm:text-3xl">✅</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-4 sm:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Offline</p>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-red-600">{stats.offline}</h2>
                                    </div>
                                    <span className="text-2xl sm:text-3xl">⭕</span>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                            <div className="flex-1 relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 border rounded-xl py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:border-slate-700"
                                />
                            </div>

                            {/* Desktop Filter */}
                            <div className="hidden sm:block">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:border-slate-700"
                                >
                                    <option value="">All Status</option>
                                    <option value="available">Available</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>

                            {/* Mobile Filter Button */}
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="sm:hidden flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-800 border rounded-xl px-4 py-2"
                            >
                                <FaFilter />
                                <span>Filter</span>
                                {statusFilter && (
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
                                        <h3 className="font-semibold text-lg">Filter Workers</h3>
                                        <button onClick={() => setShowMobileFilters(false)} className="p-1">
                                            <FaTimes />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <label className="block text-sm font-medium mb-2">Status</label>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value);
                                                setCurrentPage(1);
                                                setShowMobileFilters(false);
                                            }}
                                            className="w-full border rounded-xl px-4 py-3 dark:bg-slate-700 dark:border-slate-600"
                                        >
                                            <option value="">All Status</option>
                                            <option value="available">Available</option>
                                            <option value="offline">Offline</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && filteredWorkers.length === 0 && (
                            <div className="text-center py-12">
                                <FaUserCheck className="mx-auto text-5xl text-gray-400 mb-4" />
                                <p className="text-gray-500 text-lg">No workers found</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-xl hover:bg-amber-600 transition"
                                >
                                    Add your first worker
                                </button>
                            </div>
                        )}

                        {/* Worker Cards Grid - Responsive */}
                        {!loading && filteredWorkers.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {paginatedWorkers.map((worker) => (
                                        <div
                                            key={worker._id}
                                            className="bg-white dark:bg-slate-800 border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                                        >
                                            {/* Header */}
                                            <div className="flex flex-wrap mt-2 justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center text-xl font-semibold">
                                                        {worker.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
                                                            {worker.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <FaEnvelope className="text-gray-400 text-xs" />
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {worker.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center mt-2 gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(worker.status)}`}>
                                                    <span className="capitalize">{worker.status}</span>
                                                </span>
                                            </div>

                                            {/* Skills */}
                                            <div className="mt-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FaTools className="text-gray-400 text-sm" />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Skills</p>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {worker.skills && worker.skills.length > 0 ? (
                                                        worker.skills.slice(0, isMobile ? 2 : 3).map((skill) => (
                                                            <span
                                                                key={skill}
                                                                className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs capitalize"
                                                            >
                                                                {skill.toLowerCase().replace(/_/g, " ")}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">No skills</span>
                                                    )}
                                                    {worker.skills?.length > (isMobile ? 2 : 3) && (
                                                        <span className="text-xs text-gray-500">
                                                            +{worker.skills.length - (isMobile ? 2 : 3)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Equipment Authorization */}
                                            <div className="mt-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FaShieldAlt className="text-gray-400 text-sm" />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Equipment Auth</p>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {worker.equipmentAuth && worker.equipmentAuth.length > 0 ? (
                                                        worker.equipmentAuth.slice(0, isMobile ? 2 : 3).map((item) => (
                                                            <span
                                                                key={item}
                                                                className="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full text-xs capitalize"
                                                            >
                                                                {item.toLowerCase().replace(/_/g, " ")}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">No equipment</span>
                                                    )}
                                                    {worker.equipmentAuth?.length > (isMobile ? 2 : 3) && (
                                                        <span className="text-xs text-gray-500">
                                                            +{worker.equipmentAuth.length - (isMobile ? 2 : 3)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Stats Row */}
                                            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t dark:border-slate-700">
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <FaWeightHanging className="text-gray-400 text-xs" />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Max Weight</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                                        {worker.maxSafeWeight || 0} kg
                                                    </p>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <FaMapMarker className="text-gray-400 text-xs" />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Last Bin</p>
                                                    </div>
                                                    <p className="text-sm font-semibold font-mono text-amber-600 dark:text-amber-400">
                                                        {worker.lastBinId || "A1"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mt-4">
                                                <button
                                                    onClick={() => handleEdit(worker)}
                                                    className="flex-1 border dark:border-slate-700 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
                                                >
                                                    <FaEdit className="text-blue-500" />
                                                    <span className="text-sm">Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(worker._id, worker.name)}
                                                    className="flex-1 border dark:border-slate-700 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-2"
                                                >
                                                    <FaTrash />
                                                    <span className="text-sm">Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t dark:border-slate-700">
                                        <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                                            Showing {paginatedWorkers.length} of {filteredWorkers.length} workers
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
                    </div>
                </div>
            </DashboardLayout>

            <AddWorkerModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingWorker(null);
                }}
                onSuccess={(worker) => {
                    if (editingWorker) {
                        handleWorkerUpdated(worker);
                    } else {
                        handleWorkerCreated(worker);
                    }
                }}
                editingWorker={editingWorker}
            />
        </>
    );
}

export default Workers;