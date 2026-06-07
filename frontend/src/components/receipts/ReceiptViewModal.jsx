
// components/receipts/ReceiptViewModal.jsx
import { FaTimes, FaBox, FaCalendar, FaUser, FaBuilding } from "react-icons/fa";

function ReceiptViewModal({ open, onClose, receipt }) {
    if (!open || !receipt) return null;

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Receipt Details</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Receipt Header */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Receipt Number</p>
                            <p className="font-mono font-bold text-lg">{receipt.receiptNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(receipt.status)}`}>
                                {receipt.status}
                            </span>
                        </div>
                    </div>

                    {/* Supplier Info */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <FaBuilding /> Supplier Information
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-sm text-gray-500">Supplier Name</p>
                                <p className="font-medium">{receipt.supplier}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Expected Date</p>
                                <p className="font-medium">
                                    {receipt.expectedDate ? new Date(receipt.expectedDate).toLocaleDateString() : "Not set"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Received By */}
                    {receipt.receivedBy && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <FaUser /> Received By
                            </h3>
                            <p>{receipt.receivedBy?.name || "Unknown"}</p>
                        </div>
                    )}

                    {/* Items */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <FaBox /> Items
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="p-3 text-left text-sm">SKU Code</th>
                                        <th className="p-3 text-left text-sm">Product Name</th>
                                        <th className="p-3 text-right text-sm">Expected</th>
                                        <th className="p-3 text-right text-sm">Received</th>
                                        <th className="p-3 text-center text-sm">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receipt.items?.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-3 font-mono text-sm">
                                                {/* ✅ FIX: Use sku.skuCode instead of entire sku object */}
                                                {item.sku?.skuCode || "N/A"}
                                            </td>
                                            <td className="p-3">
                                                {/* ✅ FIX: Use sku.name */}
                                                {item.sku?.name || "N/A"}
                                            </td>
                                            <td className="p-3 text-right font-medium">
                                                {item.expectedQty}
                                            </td>
                                            <td className="p-3 text-right font-medium">
                                                {item.receivedQty || 0}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`text-xs px-2 py-1 rounded-full ${(item.receivedQty || 0) >= item.expectedQty
                                                        ? "bg-green-100 text-green-600"
                                                        : item.receivedQty > 0
                                                            ? "bg-yellow-100 text-yellow-600"
                                                            : "bg-gray-100 text-gray-600"
                                                    }`}>
                                                    {item.receivedQty >= item.expectedQty
                                                        ? "Completed"
                                                        : item.receivedQty > 0
                                                            ? "Partial"
                                                            : "Pending"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notes */}
                    {receipt.notes && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-2">Notes</h3>
                            <p className="text-gray-600 bg-gray-50 dark:bg-slate-800 p-3 rounded-xl">
                                {receipt.notes}
                            </p>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <FaCalendar /> Timeline
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created:</span>
                                <span>{new Date(receipt.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Last Updated:</span>
                                <span>{new Date(receipt.updatedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t p-6 flex justify-end">
                    <button onClick={onClose} className="px-5 py-3 border rounded-xl hover:bg-gray-50">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReceiptViewModal;