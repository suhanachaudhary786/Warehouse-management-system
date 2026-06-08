
import DashboardLayout from "../../layouts/DashboardLayout";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaUserCheck,
} from "react-icons/fa";
import AddWorkerModal from "../../components/workers/AddWorkerModal";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast"; // npm install react-hot-toast

function Workers() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        offline: 0
    });
    const [editingWorker, setEditingWorker] = useState(null);

    // Fetch workers on component mount
    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const response = await axios.get(
                "https://warehouse-management-system-backend-qro9.onrender.com/api/workers",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

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

            await axios.delete(
                `https://warehouse-management-system-backend-qro9.onrender.com/api/workers/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(`${name} deleted successfully`);
            fetchWorkers(); // Refresh list

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
        fetchWorkers(); // Refresh list
    };

    const handleWorkerUpdated = (updatedWorker) => {
        toast.success(`${updatedWorker.name} updated successfully`);
        fetchWorkers(); // Refresh list
        setEditingWorker(null);
    };

    return (
        <>
            <DashboardLayout>
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">
                            Worker Master
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Manage warehouse workforce
                        </p>
                    </div>

                    <button
                        className="
                            bg-amber-500
                            hover:bg-amber-600
                            text-white
                            px-5
                            py-3
                            rounded-xl
                            flex
                            items-center
                            gap-2
                            transition
                        "
                        onClick={() => {
                            setEditingWorker(null);
                            setIsModalOpen(true);
                        }}
                    >
                        <FaPlus />
                        Add Worker
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
                        <p className="text-gray-500">
                            Total Workers
                        </p>
                        <h2 className="text-3xl font-bold">
                            {stats.total}
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
                        <p className="text-gray-500">
                            Available
                        </p>
                        <h2 className="text-3xl font-bold text-green-600">
                            {stats.available}
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
                        <p className="text-gray-500">
                            Offline
                        </p>
                        <h2 className="text-3xl font-bold text-red-500">
                            {stats.offline}
                        </h2>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                    </div>
                )}

                {/* Worker Cards */}
                {!loading && workers.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No workers found</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-4 bg-amber-500 text-white px-4 py-2 rounded-xl"
                        >
                            Add your first worker
                        </button>
                    </div>
                )}

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {workers.map((worker) => (
                        <div
                            key={worker._id}
                            className="
                                bg-white
                                dark:bg-slate-900
                                border
                                rounded-2xl
                                p-6
                                shadow-sm
                                hover:shadow-lg
                                transition
                            "
                        >
                            <div className="flex justify-between">
                                <div>
                                    <div
                                        className="
                                            h-14
                                            w-14
                                            rounded-full
                                            bg-amber-100
                                            text-amber-600
                                            flex
                                            items-center
                                            justify-center
                                            text-xl
                                        "
                                    >
                                        <FaUserCheck />
                                    </div>

                                    <h3 className="mt-4 text-xl font-semibold">
                                        {worker.name}
                                    </h3>

                                    <p className="text-gray-500">
                                        {worker.email}
                                    </p>
                                </div>

                                <span
                                    className={`
                                        px-3
                                        py-1
                                        rounded-full
                                        h-fit
                                        text-sm
                                        font-medium
                                        ${worker.status === "available"
                                            ? "bg-green-100 text-green-600"
                                            : "bg-red-100 text-red-600"
                                        }
                                    `}
                                >
                                    {worker.status === "available" ? "Available" : "Offline"}
                                </span>
                            </div>

                            <div className="mt-5">
                                <p className="text-sm text-gray-500">
                                    Skills
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {worker.skills && worker.skills.length > 0 ? (
                                        worker.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="
                                                    bg-blue-100
                                                    text-blue-600
                                                    px-3
                                                    py-1
                                                    rounded-full
                                                    text-xs
                                                    capitalize
                                                "
                                            >
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-xs">No skills</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="text-sm text-gray-500">
                                    Equipment Authorization
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {worker.equipmentAuth && worker.equipmentAuth.length > 0 ? (
                                        worker.equipmentAuth.map((item) => (
                                            <span
                                                key={item}
                                                className="
                                                    bg-purple-100
                                                    text-purple-600
                                                    px-3
                                                    py-1
                                                    rounded-full
                                                    text-xs
                                                    capitalize
                                                "
                                            >
                                                {item.replace("_", " ")}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-xs">No equipment</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="text-sm text-gray-500">
                                    Max Safe Weight
                                </p>
                                <p className="font-semibold">
                                    {worker.maxSafeWeight || 0} Kg
                                </p>
                            </div>

                            <div className="mt-4">
                                <p className="text-sm text-gray-500">
                                    Last Bin ID
                                </p>
                                <p className="font-medium text-amber-600">
                                    {worker.lastBinId || "A1"}
                                </p>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => handleEdit(worker)}
                                    className="
                                        flex-1
                                        border
                                        py-2
                                        rounded-xl
                                        hover:bg-gray-100
                                        transition
                                    "
                                >
                                    <FaEdit className="mx-auto" />
                                </button>

                                <button
                                    onClick={() => handleDelete(worker._id, worker.name)}
                                    className="
                                        flex-1
                                        border
                                        py-2
                                        rounded-xl
                                        text-red-500
                                        hover:bg-red-50
                                        transition
                                    "
                                >
                                    <FaTrash className="mx-auto" />
                                </button>
                            </div>
                        </div>
                    ))}
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