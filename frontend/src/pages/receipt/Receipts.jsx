
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import CreateReceiptModal from "../../components/receipts/CreateReceiptModal";
import { FaPlus, FaEye, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import ReceiptViewModal from "../../components/receipts/ReceiptViewModal";

function Receipts() {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [viewOpen, setViewOpen] =
        useState(false);

    const [selectedReceipt, setSelectedReceipt] =
        useState(null);

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            const res = await api.get("/receipts");
            setReceipts(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch receipts");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this receipt?")) return;
        try {
            await api.delete(`/receipts/${id}`);
            toast.success("Receipt deleted");
            fetchReceipts();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to delete");
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            created: "bg-gray-100 text-gray-600",
            receiving: "bg-blue-100 text-blue-600",
            putaway: "bg-yellow-100 text-yellow-600",
            closed: "bg-green-100 text-green-600",
        };
        return colors[status] || "bg-gray-100 text-gray-600";
    };

    return (
        <DashboardLayout>
            <div className="p-4 md:p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Receipts (ASN)</h1>
                        <p className="text-gray-500 mt-2">Manage incoming shipments</p>
                    </div>
                    <button
                        onClick={() => setOpenModal(true)}
                        className="bg-amber-500 text-white px-5 py-3 rounded-xl flex items-center gap-2"
                    >
                        <FaPlus /> Create Receipt
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-left">Receipt #</th>
                                    <th className="p-4 text-left">Supplier</th>
                                    <th className="p-4 text-left">Items</th>
                                    <th className="p-4 text-left">Status</th>
                                    <th className="p-4 text-left">Created</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receipts.map((receipt) => (
                                    <tr key={receipt._id} className="border-b">
                                        <td className="p-4 font-mono font-medium">{receipt.receiptNumber}</td>
                                        <td className="p-4">{receipt.supplier}</td>
                                        <td className="p-4">{receipt.items.length} SKUs</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(receipt.status)}`}>
                                                {receipt.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm">{new Date(receipt.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedReceipt(receipt);
                                                        setViewOpen(true);
                                                    }}
                                                    className="text-blue-500"
                                                >
                                                    <FaEye />
                                                </button>
                                                {receipt.status === "created" && (
                                                    <button onClick={() => handleDelete(receipt._id)} className="text-red-500">
                                                        <FaTrash />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <CreateReceiptModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                refresh={fetchReceipts}
            />
            <ReceiptViewModal
                open={viewOpen}
                onClose={() =>
                    setViewOpen(false)
                }
                receipt={selectedReceipt}
            />
        </DashboardLayout>
    );
}

export default Receipts;