
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import PutawayTaskModal from "../../components/receipts/PutawayTaskModal";
import {
    FaBoxOpen,
    FaCheckCircle,
    FaClipboardList,
    FaArrowLeft,
    FaQrcode,
    FaWarehouse,
    FaTruck,
    FaBox,
    FaClock,
    FaExclamationTriangle,
    FaSearch,
    FaFilter,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

function WorkerReceiving() {
    const [receipts, setReceipts] = useState([]);
    const [putawayTasks, setPutawayTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showPutawayModal, setShowPutawayModal] = useState(false);
    const [activeTab, setActiveTab] = useState("receive");
    const [processingId, setProcessingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        fetchData();
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [receiptsRes, tasksRes] = await Promise.all([
                api.get("/receipts"),
                api.get("/receipts/putaway/tasks"),
            ]);
            setReceipts(receiptsRes.data.data || []);
            setPutawayTasks(tasksRes.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleReceive = async (receiptId) => {
        setProcessingId(receiptId);
        try {
            const receipt = receipts.find(r => r._id === receiptId);
            const items = receipt.items.map(item => ({
                skuId: item.sku._id,
                receivedQty: item.expectedQty,
            }));

            const res = await api.put(`/receipts/${receiptId}/receive`, { items });

            toast.success(res.data.message || "Goods received!");

            await fetchData();

            const updatedTasks = await api.get("/receipts/putaway/tasks");

            if (updatedTasks.data.data && updatedTasks.data.data.length > 0) {
                toast.success(`${updatedTasks.data.data.length} putaway tasks created!`);
                setActiveTab("putaway");
            }
        } catch (error) {
            console.error("Error in handleReceive:", error);
            toast.error(error?.response?.data?.message || "Failed to receive goods");
        } finally {
            setProcessingId(null);
        }
    };

    const handleCompletePutaway = async (taskId, actualBinCode) => {
        try {
            await api.put(`/receipts/putaway/complete/${taskId}`, { actualBinCode });
            toast.success("Putaway completed!");
            fetchData();
            setShowPutawayModal(false);
            setSelectedTask(null);
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to complete putaway");
        }
    };

    const pendingReceipts = receipts.filter(r => r.status === "created");
    const receivingReceipts = receipts.filter(r => r.status === "receiving");
    const pendingPutawayTasks = putawayTasks.filter(t => t.status !== "completed");

    // Filter tasks based on search
    const filteredPutawayTasks = pendingPutawayTasks.filter(task =>
        task.sku?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.sku?.skuCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.suggestedBin?.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20">
                {/* Header - Responsive */}
                <div className="bg-white dark:bg-slate-800 border-b sticky top-0 z-10">
                    <div className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                            <Link to="/dashboard" className="p-1 sm:p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                                <FaArrowLeft className="text-gray-500 text-sm sm:text-base" />
                            </Link>
                            <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">Receive & Putaway</h1>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Receive incoming goods and store in bins</p>
                    </div>

                    {/* Tabs - Responsive */}
                    <div className="flex border-t dark:border-slate-700">
                        <button
                            onClick={() => {
                                setActiveTab("receive");
                                setSearchTerm("");
                            }}
                            className={`flex-1 py-2.5 sm:py-3 text-center font-medium transition ${activeTab === "receive"
                                ? "text-amber-500 border-b-2 border-amber-500"
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                <FaBoxOpen className="text-sm sm:text-base" />
                                <span className="text-xs sm:text-sm">Receive ({pendingReceipts.length})</span>
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("putaway");
                                setSearchTerm("");
                            }}
                            className={`flex-1 py-2.5 sm:py-3 text-center font-medium transition ${activeTab === "putaway"
                                ? "text-amber-500 border-b-2 border-amber-500"
                                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                <FaWarehouse className="text-sm sm:text-base" />
                                <span className="text-xs sm:text-sm">Putaway ({pendingPutawayTasks.length})</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="p-3 sm:p-4 md:p-6">
                    {/* Receive Tab */}
                    {activeTab === "receive" && (
                        <>
                            {pendingReceipts.length === 0 && receivingReceipts.length === 0 ? (
                                <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaBoxOpen className="text-2xl sm:text-3xl text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">No pending receipts</p>
                                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                                        Manager needs to create a receipt first
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {/* Pending Receipts Cards */}
                                    {pendingReceipts.map((receipt) => (
                                        <div key={receipt._id} className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm border overflow-hidden">
                                            <div className="p-3 sm:p-4 border-b bg-amber-50 dark:bg-amber-900/20">
                                                <div className="flex justify-between items-start flex-wrap gap-2">
                                                    <div>
                                                        <p className="font-mono font-bold text-xs sm:text-sm text-gray-800 dark:text-white">{receipt.receiptNumber}</p>
                                                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{receipt.supplier}</p>
                                                    </div>
                                                    <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
                                                        Pending
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-3 sm:p-4">
                                                <div className="space-y-2 mb-3 sm:mb-4">
                                                    {receipt.items.slice(0, isMobile ? 3 : 5).map((item, idx) => (
                                                        <div key={idx} className="flex justify-between text-xs sm:text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">{item.sku?.skuCode}</span>
                                                            <span className="font-medium text-gray-800 dark:text-white">{item.expectedQty} units</span>
                                                        </div>
                                                    ))}
                                                    {receipt.items.length > (isMobile ? 3 : 5) && (
                                                        <p className="text-xs text-gray-400 text-center">
                                                            +{receipt.items.length - (isMobile ? 3 : 5)} more items
                                                        </p>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => handleReceive(receipt._id)}
                                                    disabled={processingId === receipt._id}
                                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 sm:py-3 rounded-xl font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                                                >
                                                    {processingId === receipt._id ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaTruck className="text-sm" />
                                                            Receive & Create Putaway
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* In Progress Receipts */}
                                    {receivingReceipts.map((receipt) => (
                                        <div key={receipt._id} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-800 p-3 sm:p-4">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <FaClipboardList className="text-blue-500 text-base" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-mono font-medium text-xs sm:text-sm text-gray-800 dark:text-white">{receipt.receiptNumber}</p>
                                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Putaway in progress</p>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        await fetchData();
                                                        setActiveTab("putaway");
                                                    }}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm transition w-full sm:w-auto"
                                                >
                                                    Continue
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Putaway Tab */}
                    {activeTab === "putaway" && (
                        <>
                            {pendingPutawayTasks.length === 0 ? (
                                <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaWarehouse className="text-2xl sm:text-3xl text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">No pending putaway tasks</p>
                                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                                        Receive goods first to generate putaway tasks
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Search Bar - Putaway */}
                                    <div className="mb-4">
                                        <div className="relative">
                                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                            <input
                                                type="text"
                                                placeholder="Search by product or bin..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2.5 border dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 dark:bg-slate-800 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 sm:space-y-4">
                                        {filteredPutawayTasks.map((task) => (
                                            <div key={task._id} className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm border overflow-hidden">
                                                <div className="p-3 sm:p-4 border-b bg-green-50 dark:bg-green-900/20">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <FaBoxOpen className="text-green-600 text-sm sm:text-base" />
                                                            <span className="font-semibold capitalize text-sm sm:text-base text-gray-800 dark:text-white">
                                                                {task.taskType} Task
                                                            </span>
                                                        </div>
                                                        <span className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                                                            {task.suggestedBin?.code || task.destinationBin?.code}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-3 sm:p-4">
                                                    <div className="mb-3 sm:mb-4">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Product</p>
                                                        <p className="font-medium text-sm sm:text-base text-gray-800 dark:text-white">{task.sku?.name}</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-1">{task.sku?.skuCode}</p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 mb-3 sm:mb-4">
                                                        <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-2 sm:p-3 text-center">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
                                                            <p className="font-bold text-lg sm:text-xl text-gray-800 dark:text-white">{task.qty}</p>
                                                            <p className="text-xs text-gray-400">units</p>
                                                        </div>
                                                        <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-2 sm:p-3 text-center">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">Required Space</p>
                                                            <p className="font-bold text-base sm:text-lg text-gray-800 dark:text-white">{task.requiredVolume?.toFixed(0)}</p>
                                                            <p className="text-xs text-gray-400">cu units</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            setSelectedTask(task);
                                                            setShowPutawayModal(true);
                                                        }}
                                                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 sm:py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 text-sm sm:text-base"
                                                    >
                                                        <FaQrcode className="text-sm" />
                                                        Complete Putaway
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Results Count */}
                                    {filteredPutawayTasks.length !== pendingPutawayTasks.length && (
                                        <p className="text-center text-xs text-gray-500 mt-4">
                                            Showing {filteredPutawayTasks.length} of {pendingPutawayTasks.length} tasks
                                        </p>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Putaway Modal */}
            <PutawayTaskModal
                open={showPutawayModal}
                onClose={() => {
                    setShowPutawayModal(false);
                    setSelectedTask(null);
                }}
                task={selectedTask}
                onComplete={handleCompletePutaway}
            />
        </DashboardLayout>
    );
}

export default WorkerReceiving;