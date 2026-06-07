
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import InventoryFormModal from "../../components/inventory/InventoryFormModal";
import { FaBoxes, FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";

function InventoryPage() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedInventory, setSelectedInventory] = useState(null);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const res = await api.get("/inventory");
            setInventory(res.data.data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Delete this inventory record?");
        if (!confirmDelete) return;

        try {
            await api.delete(`/inventory/${id}`);
            fetchInventory();
        } catch (error) {
            console.log(error);
            alert(error?.response?.data?.message || "Failed to delete inventory");
        }
    };

    // Filter inventory based on search and status
    const filteredInventory = inventory.filter((item) => {
        const matchesSearch = item?.sku?.name?.toLowerCase().includes(search.toLowerCase()) ||
            item?.sku?.skuCode?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case "available":
                return "bg-green-100 text-green-600";
            case "allocated":
                return "bg-blue-100 text-blue-600";
            case "picked":
                return "bg-purple-100 text-purple-600";
            case "hold":
                return "bg-yellow-100 text-yellow-600";
            case "damaged":
                return "bg-red-100 text-red-600";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    // Calculate stats
    const totalRecords = inventory.length;
    const availableCount = inventory.filter(item => item.status === "available").length;
    const allocatedCount = inventory.filter(item => item.status === "allocated").length;
    const pickedCount = inventory.filter(item => item.status === "picked").length;
    const holdCount = inventory.filter(item => item.status === "hold").length;
    const damagedCount = inventory.filter(item => item.status === "damaged").length;

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold">Inventory</h1>
                    <p className="text-gray-500 mt-2">Manage warehouse stock</p>
                </div>

                <button
                    onClick={() => {
                        setSelectedInventory(null);
                        setOpenModal(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition"
                >
                    <FaPlus />
                    Add Inventory
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by SKU name or code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                </div>

                <div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full md:w-48 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500"
                    >
                        <option value="">All Status</option>
                        <option value="available">Available</option>
                        <option value="allocated">Allocated</option>
                        <option value="picked">Picked</option>
                        <option value="hold">Hold</option>
                        <option value="damaged">Damaged</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-900 border rounded-2xl p-4">
                    <p className="text-gray-500 text-sm">Total Records</p>
                    <h2 className="text-2xl font-bold">{totalRecords}</h2>
                </div>

                <div className="bg-white dark:bg-slate-900 border rounded-2xl p-4">
                    <p className="text-gray-500 text-sm">Available</p>
                    <h2 className="text-2xl font-bold text-green-600">{availableCount}</h2>
                </div>

                <div className="bg-white dark:bg-slate-900 border rounded-2xl p-4">
                    <p className="text-gray-500 text-sm">Allocated</p>
                    <h2 className="text-2xl font-bold text-blue-600">{allocatedCount}</h2>
                </div>

                <div className="bg-white dark:bg-slate-900 border rounded-2xl p-4">
                    <p className="text-gray-500 text-sm">Picked</p>
                    <h2 className="text-2xl font-bold text-purple-600">{pickedCount}</h2>
                </div>

                <div className="bg-white dark:bg-slate-900 border rounded-2xl p-4">
                    <p className="text-gray-500 text-sm">Hold/Damaged</p>
                    <h2 className="text-2xl font-bold text-red-600">{holdCount + damagedCount}</h2>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-50 dark:bg-slate-800">
                                <th className="p-4 text-left">SKU</th>
                                <th className="p-4 text-left">SKU Code</th>
                                <th className="p-4 text-left">Bin</th>
                                <th className="p-4 text-left">Quantity</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-left">Last Updated</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredInventory.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-gray-500">
                                        No inventory found
                                    </td>
                                </tr>
                            ) : (
                                filteredInventory.map((item) => (
                                    <tr key={item._id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <FaBoxes className="text-amber-500" />
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {item?.sku?.name || "N/A"}
                                                    </h3>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-sm">
                                                {item?.sku?.skuCode || "N/A"}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono">
                                                {item?.bin?.code || "N/A"}
                                            </span>
                                        </td>
                                        <td className="p-4 font-semibold">
                                            {item.qty} units
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(item.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-4">
                                                <button
                                                    onClick={() => {
                                                        setSelectedInventory(item);
                                                        setOpenModal(true);
                                                    }}
                                                    className="text-blue-500 hover:text-blue-700 transition"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="text-red-500 hover:text-red-700 transition"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <InventoryFormModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedInventory(null);
                }}
                selectedInventory={selectedInventory}
                refresh={fetchInventory}
            />
        </DashboardLayout>
    );
}

export default InventoryPage;