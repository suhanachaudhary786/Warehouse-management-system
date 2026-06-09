
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import SKUFormModal from "../../components/sku/SKUFormModal";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaBarcode,
    FaSearch,
    FaFilter,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
    FaBox,
    FaWeightHanging,
    FaRuler,
    FaTachometerAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";

function SKUPage() {
    const [skus, setSkus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedSku, setSelectedSku] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchSkus = async () => {
        try {
            setLoading(true);
            const res = await api.get("/skus");
            setSkus(res.data.data || []);
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch SKUs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkus();
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
        const confirmDelete = window.confirm("Delete this SKU?");
        if (!confirmDelete) return;

        try {
            await api.delete(`/skus/${id}`);
            toast.success("SKU deleted successfully");
            fetchSkus();
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete SKU");
        }
    };

    const filteredSkus = skus.filter((sku) =>
        sku.name?.toLowerCase().includes(search.toLowerCase()) ||
        sku.skuCode?.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const totalPages = Math.ceil(filteredSkus.length / itemsPerPage);
    const paginatedSkus = filteredSkus.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getVelocityColor = (velocityClass) => {
        const colors = {
            FAST: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            MEDIUM: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
            SLOW: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        };
        return colors[velocityClass] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    const getVelocityIcon = (velocityClass) => {
        const icons = {
            FAST: "⚡",
            MEDIUM: "🟡",
            SLOW: "🐢",
        };
        return icons[velocityClass] || "📦";
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                    {/* Header - Responsive */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                                SKU Master
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
                                Manage warehouse SKUs and product catalog
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedSku(null);
                                setOpenModal(true);
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-xl flex items-center gap-2 transition shadow-md hover:shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
                        >
                            <FaPlus className="text-sm sm:text-base" />
                            <span>Create SKU</span>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total SKUs</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">{skus.length}</h2>
                                </div>
                                <FaBarcode className="text-amber-500 text-xl sm:text-2xl" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Fast Moving</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-green-600">
                                        {skus.filter(s => s.velocityClass === "FAST").length}
                                    </h2>
                                </div>
                                <span className="text-xl">⚡</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Medium Moving</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-yellow-600">
                                        {skus.filter(s => s.velocityClass === "MEDIUM").length}
                                    </h2>
                                </div>
                                <span className="text-xl">🟡</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border p-3 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Slow Moving</p>
                                    <h2 className="text-xl sm:text-2xl font-bold text-red-600">
                                        {skus.filter(s => s.velocityClass === "SLOW").length}
                                    </h2>
                                </div>
                                <span className="text-xl">🐢</span>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                            <input
                                type="text"
                                placeholder="Search by SKU code or product name..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full sm:w-96 border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white transition"
                            />
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    {isMobile && (
                        <div className="space-y-3 mb-6">
                            {loading ? (
                                <div className="text-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                                </div>
                            ) : paginatedSkus.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    No SKUs found
                                </div>
                            ) : (
                                paginatedSkus.map((sku) => (
                                    <div key={sku._id} className="bg-white dark:bg-slate-800 rounded-xl border p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-mono font-semibold text-sm">{sku.skuCode}</p>
                                                <h3 className="font-semibold text-base mt-1">{sku.name}</h3>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedSku(sku);
                                                        setOpenModal(true);
                                                    }}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sku._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-3 pt-2 border-t dark:border-slate-700">
                                            <div>
                                                <p className="text-xs text-gray-500">Dimensions</p>
                                                <p className="text-sm">
                                                    {sku.length && sku.width && sku.height
                                                        ? `${sku.length}×${sku.width}×${sku.height} cm`
                                                        : "-"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Weight</p>
                                                <p className="text-sm">{sku.weight} kg</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Velocity</p>
                                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getVelocityColor(sku.velocityClass)}`}>
                                                    <span>{getVelocityIcon(sku.velocityClass)}</span>
                                                    <span>{sku.velocityClass}</span>
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Handling</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {sku.handlingClasses?.slice(0, 2).map((cls) => (
                                                        <span key={cls} className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                                                            {cls}
                                                        </span>
                                                    ))}
                                                    {sku.handlingClasses?.length > 2 && (
                                                        <span className="text-xs text-gray-500">+{sku.handlingClasses.length - 2}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Desktop Table View */}
                    {!isMobile && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-slate-700">
                                        <tr className="border-b dark:border-slate-600">
                                            <th className="p-4 text-left text-sm font-semibold">SKU Code</th>
                                            <th className="p-4 text-left text-sm font-semibold">Name</th>
                                            <th className="p-4 text-left text-sm font-semibold">Dimensions</th>
                                            <th className="p-4 text-left text-sm font-semibold">Weight</th>
                                            <th className="p-4 text-left text-sm font-semibold">Velocity</th>
                                            <th className="p-4 text-left text-sm font-semibold">Handling</th>
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
                                        ) : paginatedSkus.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-10 text-gray-500">
                                                    No SKUs found
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedSkus.map((sku) => (
                                                <tr key={sku._id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <FaBarcode className="text-amber-500 text-sm" />
                                                            <p className="font-mono text-sm font-semibold">{sku.skuCode}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <h3 className="font-semibold text-sm">{sku.name}</h3>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-1">
                                                            <FaRuler className="text-gray-400 text-xs" />
                                                            <span className="text-sm">
                                                                {sku.length && sku.width && sku.height
                                                                    ? `${sku.length}×${sku.width}×${sku.height} cm`
                                                                    : "-"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-1">
                                                            <FaWeightHanging className="text-gray-400 text-xs" />
                                                            <span className="text-sm">{sku.weight} kg</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getVelocityColor(sku.velocityClass)}`}>
                                                            <span>{getVelocityIcon(sku.velocityClass)}</span>
                                                            <span>{sku.velocityClass}</span>
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {sku.handlingClasses?.slice(0, 2).map((cls) => (
                                                                <span key={cls} className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                                                                    {cls}
                                                                </span>
                                                            ))}
                                                            {sku.handlingClasses?.length > 2 && (
                                                                <span className="text-xs text-gray-500">+{sku.handlingClasses.length - 2}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedSku(sku);
                                                                    setOpenModal(true);
                                                                }}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                                                title="Edit SKU"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(sku._id)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                                title="Delete SKU"
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
                    )}

                    {/* Pagination */}
                    {filteredSkus.length > 0 && totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t dark:border-slate-700">
                            <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                                Showing {paginatedSkus.length} of {filteredSkus.length} SKUs
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
                </div>
            </div>

            {/* SKU Form Modal */}
            <SKUFormModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                selectedSku={selectedSku}
                refresh={fetchSkus}
            />
        </DashboardLayout>
    );
}

export default SKUPage;