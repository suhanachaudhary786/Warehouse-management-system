
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import InventoryFormModal from "../../components/inventory/InventoryFormModal";
import { FaBoxes, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

function InventoryPage() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedInventory, setSelectedInventory] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        setItemsPerPage(mobile ? 5 : 10);
        setCurrentPage(1);
    };

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

    // Pagination
    const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
    const paginatedInventory = filteredInventory.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusColor = (status) => {
        switch (status) {
            case "available":
                return "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400";
            case "allocated":
                return "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
            case "picked":
                return "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400";
            case "hold":
                return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400";
            case "damaged":
                return "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
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
            <div className="p-4 sm:p-6 md:p-8">
                {/* Header - Responsive */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                            Inventory
                        </h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                            Manage warehouse stock
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedInventory(null);
                            setOpenModal(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl flex items-center gap-2 transition text-sm sm:text-base w-full sm:w-auto justify-center"
                    >
                        <FaPlus className="text-sm sm:text-base" />
                        <span>Add Inventory</span>
                    </button>
                </div>

                {/* Search and Filter - Responsive */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                    <div className="flex-1">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="text"
                                placeholder="Search by SKU name or code..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 border rounded-xl py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:border-slate-700"
                            />
                        </div>
                    </div>

                    {/* Desktop Filter */}
                    <div className="hidden sm:block">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full md:w-48 border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:border-slate-700"
                        >
                            <option value="">All Status</option>
                            <option value="available">Available</option>
                            <option value="allocated">Allocated</option>
                            <option value="picked">Picked</option>
                            <option value="hold">Hold</option>
                            <option value="damaged">Damaged</option>
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
                                <h3 className="font-semibold text-lg">Filter by Status</h3>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="p-4">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                        setShowMobileFilters(false);
                                    }}
                                    className="w-full border rounded-xl px-4 py-3 text-base dark:bg-slate-700 dark:border-slate-600"
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
                    </div>
                )}

                {/* Stats - Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 md:mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                        <p className="text-gray-500 text-xs sm:text-sm">Total Records</p>
                        <h2 className="text-xl sm:text-2xl font-bold">{totalRecords}</h2>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                        <p className="text-gray-500 text-xs sm:text-sm">Available</p>
                        <h2 className="text-xl sm:text-2xl font-bold text-green-600">{availableCount}</h2>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                        <p className="text-gray-500 text-xs sm:text-sm">Allocated</p>
                        <h2 className="text-xl sm:text-2xl font-bold text-blue-600">{allocatedCount}</h2>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                        <p className="text-gray-500 text-xs sm:text-sm">Picked</p>
                        <h2 className="text-xl sm:text-2xl font-bold text-purple-600">{pickedCount}</h2>
                    </div>

                    <div className="col-span-2 sm:col-span-3 lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                        <p className="text-gray-500 text-xs sm:text-sm">Hold/Damaged</p>
                        <h2 className="text-xl sm:text-2xl font-bold text-red-600">{holdCount + damagedCount}</h2>
                    </div>
                </div>

                {/* Mobile Card View */}
                {isMobile && (
                    <div className="space-y-3 mb-6">
                        {loading ? (
                            <div className="text-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                            </div>
                        ) : paginatedInventory.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                No inventory found
                            </div>
                        ) : (
                            paginatedInventory.map((item) => (
                                <div key={item._id} className="bg-white dark:bg-slate-800 rounded-xl border p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <FaBoxes className="text-amber-500 text-lg" />
                                            <div>
                                                <h3 className="font-semibold text-base">
                                                    {item?.sku?.name || "N/A"}
                                                </h3>
                                                <p className="text-xs text-gray-500 font-mono">
                                                    {item?.sku?.skuCode || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                        <div>
                                            <p className="text-gray-500 text-xs">Bin Location</p>
                                            <p className="font-mono font-medium">{item?.bin?.code || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs">Quantity</p>
                                            <p className="font-semibold">{item.qty} units</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-gray-500 text-xs">Last Updated</p>
                                            <p className="text-xs">{new Date(item.updatedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-4 pt-2 border-t dark:border-slate-700">
                                        <button
                                            onClick={() => {
                                                setSelectedInventory(item);
                                                setOpenModal(true);
                                            }}
                                            className="text-blue-500 hover:text-blue-700 transition p-2"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="text-red-500 hover:text-red-700 transition p-2"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Desktop Table View */}
                {!isMobile && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50 dark:bg-slate-800">
                                        <th className="p-4 text-left text-sm font-semibold">SKU</th>
                                        <th className="p-4 text-left text-sm font-semibold">SKU Code</th>
                                        <th className="p-4 text-left text-sm font-semibold">Bin</th>
                                        <th className="p-4 text-left text-sm font-semibold">Quantity</th>
                                        <th className="p-4 text-left text-sm font-semibold">Status</th>
                                        <th className="p-4 text-left text-sm font-semibold">Last Updated</th>
                                        <th className="p-4 text-center text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-10">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                                            </td>
                                        </tr>
                                    ) : paginatedInventory.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-10 text-gray-500">
                                                No inventory found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedInventory.map((item) => (
                                            <tr key={item._id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <FaBoxes className="text-amber-500" />
                                                        <h3 className="font-semibold text-sm">
                                                            {item?.sku?.name || "N/A"}
                                                        </h3>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-mono text-sm">
                                                        {item?.sku?.skuCode || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-mono text-sm">
                                                        {item?.bin?.code || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-semibold text-sm">
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
                                                    <div className="flex justify-center gap-3">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedInventory(item);
                                                                setOpenModal(true);
                                                            }}
                                                            className="text-blue-500 hover:text-blue-700 transition p-1"
                                                        >
                                                            <FaEdit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item._id)}
                                                            className="text-red-500 hover:text-red-700 transition p-1"
                                                        >
                                                            <FaTrash size={18} />
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
                )}

                {/* Pagination */}
                {filteredInventory.length > 0 && totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t dark:border-slate-700">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                        >
                            <FaChevronLeft className="inline mr-1" size={12} /> Prev
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                            </span>
                            {!isMobile && (
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border rounded-lg px-2 py-1 text-sm dark:bg-slate-700 dark:border-slate-600"
                                >
                                    <option value={5}>5 / page</option>
                                    <option value={10}>10 / page</option>
                                    <option value={20}>20 / page</option>
                                    <option value={50}>50 / page</option>
                                </select>
                            )}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                        >
                            Next <FaChevronRight className="inline ml-1" size={12} />
                        </button>
                    </div>
                )}

                {/* Results Count */}
                <div className="mt-4 text-center text-xs sm:text-sm text-gray-500">
                    Showing {paginatedInventory.length} of {filteredInventory.length} records
                    {search || statusFilter ? " (filtered)" : ""}
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
