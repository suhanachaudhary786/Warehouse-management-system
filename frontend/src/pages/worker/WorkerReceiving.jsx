
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

    useEffect(() => {
        fetchData();
    }, []);

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


    // pages/worker/WorkerReceiving.jsx - Updated handleReceive function

    const handleReceive = async (receiptId) => {
        setProcessingId(receiptId);
        try {
            const receipt = receipts.find(r => r._id === receiptId);
            const items = receipt.items.map(item => ({
                skuId: item.sku._id,
                receivedQty: item.expectedQty,
            }));

            console.log("Receiving goods for receipt:", receiptId);
            console.log("Items to receive:", items);

            const res = await api.put(`/receipts/${receiptId}/receive`, { items });

            console.log("API Response:", res.data);

            toast.success(res.data.message || "Goods received!");

            // Important: Refresh data to get putaway tasks
            await fetchData();

            // After refresh, check if putaway tasks exist
            const updatedReceipts = await api.get("/receipts");
            const updatedTasks = await api.get("/receipts/putaway/tasks");

            console.log("Updated receipts:", updatedReceipts.data.data);
            console.log("Updated putaway tasks:", updatedTasks.data.data);

            // Auto-switch to putaway tab if tasks exist
            if (updatedTasks.data.data && updatedTasks.data.data.length > 0) {
                toast.success(`${updatedTasks.data.data.length} putaway tasks created!`);
                setActiveTab("putaway");
            }

        } catch (error) {
            console.error("Error in handleReceive:", error);
            console.error("Error response:", error.response?.data);
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
    // const pendingPutawayTasks = putawayTasks.filter(t => t.status === "pending");

    const pendingPutawayTasks = putawayTasks.filter(t => t.status !== "completed");


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
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 border-b sticky top-0 z-10">
                    <div className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Link to="/dashboard" className="p-2 -ml-2">
                                <FaArrowLeft className="text-gray-500" />
                            </Link>
                            <h1 className="text-xl font-bold">Receive & Putaway</h1>
                        </div>
                        <p className="text-sm text-gray-500">Receive incoming goods and store in bins</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-t">
                        <button
                            onClick={() => setActiveTab("receive")}
                            className={`flex-1 py-3 text-center font-medium transition ${activeTab === "receive"
                                ? "text-amber-500 border-b-2 border-amber-500"
                                : "text-gray-500"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FaBoxOpen />
                                <span>Receive ({pendingReceipts.length})</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("putaway")}
                            className={`flex-1 py-3 text-center font-medium transition ${activeTab === "putaway"
                                ? "text-amber-500 border-b-2 border-amber-500"
                                : "text-gray-500"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FaWarehouse />
                                <span>Putaway ({pendingPutawayTasks.length})</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {/* Receive Tab */}
                    {activeTab === "receive" && (
                        <>
                            {pendingReceipts.length === 0 && receivingReceipts.length === 0 ? (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaBoxOpen className="text-3xl text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No pending receipts</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Manager needs to create a receipt first
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Pending Receipts Cards */}
                                    {pendingReceipts.map((receipt) => (
                                        <div key={receipt._id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border overflow-hidden">
                                            <div className="p-4 border-b bg-amber-50 dark:bg-amber-900/20">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-mono font-bold text-sm">{receipt.receiptNumber}</p>
                                                        <p className="text-gray-600 text-sm">{receipt.supplier}</p>
                                                    </div>
                                                    <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs">
                                                        Pending
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <div className="space-y-2 mb-4">
                                                    {receipt.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <span className="text-gray-600">{item.sku?.skuCode}</span>
                                                            <span className="font-medium">{item.expectedQty} units</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={() => handleReceive(receipt._id)}
                                                    disabled={processingId === receipt._id}
                                                    className="w-full bg-amber-500 text-white py-3 rounded-xl font-medium hover:bg-amber-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {processingId === receipt._id ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Receive & Create Putaway
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* In Progress Receipts */}
                                    {receivingReceipts.map((receipt) => (
                                        <div key={receipt._id} className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <FaClipboardList className="text-blue-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-mono font-medium text-sm">{receipt.receiptNumber}</p>
                                                    <p className="text-sm text-gray-600">Putaway in progress</p>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        console.log("Continue clicked - fetching putaway tasks...");
                                                        setLoading(true);
                                                        await fetchData();
                                                        setActiveTab("putaway");
                                                        setLoading(false);
                                                    }}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
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
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaWarehouse className="text-3xl text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No pending putaway tasks</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Receive goods first to generate putaway tasks
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingPutawayTasks.map((task) => (
                                        <div key={task._id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border overflow-hidden">
                                            <div className="p-4 border-b bg-green-50 dark:bg-green-900/20">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <FaBoxOpen className="text-green-600" />
                                                        <span className="font-semibold capitalize">{task.taskType} Task</span>
                                                    </div>
                                                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                                                        Suggested: {task.suggestedBin?.code || task.destinationBin?.code}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-500">Product</p>
                                                    <p className="font-medium">{task.sku?.name}</p>
                                                    <p className="text-xs text-gray-400 font-mono mt-1">{task.sku?.skuCode}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-2 text-center">
                                                        <p className="text-xs text-gray-500">Quantity</p>
                                                        <p className="font-bold text-lg">{task.qty}</p>
                                                        <p className="text-xs text-gray-400">units</p>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-2 text-center">
                                                        <p className="text-xs text-gray-500">Required Space</p>
                                                        <p className="font-bold text-sm">{task.requiredVolume?.toFixed(0)}</p>
                                                        <p className="text-xs text-gray-400">cu units</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        setShowPutawayModal(true);
                                                    }}
                                                    className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                                                >
                                                    <FaQrcode />
                                                    Complete Putaway
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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