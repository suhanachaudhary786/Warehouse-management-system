
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import CreateReturnModal from "../../components/returns/CreateReturnModal";
import ReturnDetailsModal from "../../components/returns/ReturnDetailsModal";
import {
    FaPlus,
    FaEye,
    FaCheckCircle,
    FaTrash,
    FaBan,
    FaSearch,
    FaBoxOpen,
} from "react-icons/fa";
import toast from "react-hot-toast";

function Returns() {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const res = await api.get("/returns/all");
            setReturns(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch returns");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, []);

    const handleRestock = async (id) => {
        if (!window.confirm("Restock this item back to inventory?")) return;

        try {
            await api.put(`/returns/restock/${id}`);
            toast.success("Item restocked successfully");
            fetchReturns();
        } catch (error) {
            console.error(error);
            toast.error("Failed to restock item");
        }
    };

    const handleDamage = async (id) => {
        if (!window.confirm("Mark this return as damaged?")) return;

        try {
            await api.put(`/returns/damage/${id}`);
            toast.success("Item marked as damaged");
            fetchReturns();
        } catch (error) {
            console.error(error);
            toast.error("Failed to mark as damaged");
        }
    };

    const handleQuarantine = async (id) => {
        if (!window.confirm("Move this item to quarantine?")) return;

        try {
            await api.put(`/returns/quarantine/${id}`);
            toast.success("Item moved to quarantine");
            fetchReturns();
        } catch (error) {
            console.error(error);
            toast.error("Failed to quarantine item");
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-600",
            inspected: "bg-blue-100 text-blue-600",
            restocked: "bg-green-100 text-green-600",
            damaged: "bg-red-100 text-red-600",
            quarantined: "bg-purple-100 text-purple-600",
        };
        return colors[status] || "bg-gray-100 text-gray-600";
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: "⏳",
            inspected: "🔍",
            restocked: "✅",
            damaged: "❌",
            quarantined: "⚠️",
        };
        return icons[status] || "📋";
    };

    const filteredReturns = returns.filter((returnItem) => {
        const matchesSearch =
            returnItem.order?.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
            returnItem.sku?.skuCode?.toLowerCase().includes(search.toLowerCase()) ||
            returnItem.sku?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter ? returnItem.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: returns.length,
        pending: returns.filter(r => r.status === "pending").length,
        restocked: returns.filter(r => r.status === "restocked").length,
        damaged: returns.filter(r => r.status === "damaged").length,
        quarantined: returns.filter(r => r.status === "quarantined").length,
    };

    return (
        <DashboardLayout>
            <div className="p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                            Returns Management
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Process customer returns and manage reverse logistics
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedReturn(null);
                            setOpenModal(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition"
                    >
                        <FaPlus /> Create Return
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <p className="text-gray-500 text-sm">Total Returns</p>
                        <h2 className="text-2xl font-bold">{stats.total}</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <p className="text-gray-500 text-sm">Pending</p>
                        <h2 className="text-2xl font-bold text-yellow-600">{stats.pending}</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <p className="text-gray-500 text-sm">Restocked</p>
                        <h2 className="text-2xl font-bold text-green-600">{stats.restocked}</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <p className="text-gray-500 text-sm">Damaged</p>
                        <h2 className="text-2xl font-bold text-red-600">{stats.damaged}</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4">
                        <p className="text-gray-500 text-sm">Quarantined</p>
                        <h2 className="text-2xl font-bold text-purple-600">{stats.quarantined}</h2>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by order #, SKU code, or product name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 border rounded-xl py-3 focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="inspected">Inspected</option>
                        <option value="restocked">Restocked</option>
                        <option value="damaged">Damaged</option>
                        <option value="quarantined">Quarantined</option>
                    </select>
                </div>

                {/* Returns Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-slate-700">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold">Order #</th>
                                    <th className="p-4 text-left text-sm font-semibold">Product</th>
                                    <th className="p-4 text-left text-sm font-semibold">SKU</th>
                                    <th className="p-4 text-center text-sm font-semibold">Quantity</th>
                                    <th className="p-4 text-left text-sm font-semibold">Reason</th>
                                    <th className="p-4 text-left text-sm font-semibold">Status</th>
                                    <th className="p-4 text-left text-sm font-semibold">Return Date</th>
                                    <th className="p-4 text-center text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : filteredReturns.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-10 text-gray-500">
                                            No returns found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReturns.map((returnItem) => (
                                        <tr key={returnItem._id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                                            <td className="p-4">
                                                <p className="font-mono font-semibold text-sm">{returnItem.order?.orderNumber}</p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <FaBoxOpen className="text-amber-500" />
                                                    <span>{returnItem.sku?.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-mono text-sm">{returnItem.sku?.skuCode}</p>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="font-semibold">{returnItem.qty}</span>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm max-w-xs truncate">{returnItem.reason || "-"}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(returnItem.status)}`}>
                                                    <span>{getStatusIcon(returnItem.status)}</span>
                                                    <span className="capitalize">{returnItem.status}</span>
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {new Date(returnItem.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedReturn(returnItem);
                                                            setOpenDetailsModal(true);
                                                        }}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </button>

                                                    {returnItem.status === "pending" && (
                                                        <>
                                                            <button
                                                                onClick={() => handleRestock(returnItem._id)}
                                                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition"
                                                                title="Restock"
                                                            >
                                                                <FaCheckCircle />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDamage(returnItem._id)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                                title="Mark Damaged"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                            <button
                                                                onClick={() => handleQuarantine(returnItem._id)}
                                                                className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition"
                                                                title="Quarantine"
                                                            >
                                                                <FaBan />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateReturnModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                refresh={fetchReturns}
            />

            <ReturnDetailsModal
                open={openDetailsModal}
                onClose={() => setOpenDetailsModal(false)}
                returnItem={selectedReturn}
                onRestock={handleRestock}
                onDamage={handleDamage}
                onQuarantine={handleQuarantine}
            />
        </DashboardLayout>
    );
}

export default Returns;