
import { FaTimes, FaBox, FaShoppingCart, FaUser, FaCalendar, FaClipboardList } from "react-icons/fa";

function ReturnDetailsModal({ open, onClose, returnItem, onRestock, onDamage, onQuarantine }) {
    if (!open || !returnItem) return null;

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

    const statusActions = {
        pending: [
            { label: "Restock", action: onRestock, color: "green", icon: "✅" },
            { label: "Mark Damaged", action: onDamage, color: "red", icon: "❌" },
            { label: "Quarantine", action: onQuarantine, color: "purple", icon: "⚠️" },
        ],
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Return Details</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Return ID</p>
                            <p className="font-mono text-sm">{returnItem._id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(returnItem.status)}`}>
                                {returnItem.status}
                            </span>
                        </div>
                    </div>

                    {/* Order Information */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <FaShoppingCart /> Order Information
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-sm text-gray-500">Order Number</p>
                                <p className="font-mono">{returnItem.order?.orderNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Customer</p>
                                <p>{returnItem.order?.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Order Date</p>
                                <p>{new Date(returnItem.order?.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Order Status</p>
                                <span className="capitalize">{returnItem.order?.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Information */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <FaBox /> Product Information
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-sm text-gray-500">SKU Code</p>
                                <p className="font-mono">{returnItem.sku?.skuCode}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Product Name</p>
                                <p>{returnItem.sku?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Quantity Returned</p>
                                <p className="font-semibold text-lg">{returnItem.qty} units</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Weight per Unit</p>
                                <p>{returnItem.sku?.weight} kg</p>
                            </div>
                        </div>
                    </div>

                    {/* Return Reason */}
                    {returnItem.reason && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <FaClipboardList /> Return Reason
                            </h3>
                            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl">
                                <p className="text-gray-700 dark:text-gray-300">{returnItem.reason}</p>
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <FaCalendar /> Timeline
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Return Created:</span>
                                <span>{new Date(returnItem.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Last Updated:</span>
                                <span>{new Date(returnItem.updatedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons for Pending Returns */}
                {returnItem.status === "pending" && (
                    <div className="border-t p-6">
                        <h3 className="font-semibold mb-3">Actions</h3>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => {
                                    onRestock(returnItem._id);
                                    onClose();
                                }}
                                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 flex items-center justify-center gap-2"
                            >
                                ✅ Restock Item
                            </button>
                            <button
                                onClick={() => {
                                    onDamage(returnItem._id);
                                    onClose();
                                }}
                                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 flex items-center justify-center gap-2"
                            >
                                ❌ Mark Damaged
                            </button>
                            <button
                                onClick={() => {
                                    onQuarantine(returnItem._id);
                                    onClose();
                                }}
                                className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 flex items-center justify-center gap-2"
                            >
                                ⚠️ Quarantine
                            </button>
                        </div>
                    </div>
                )}

                <div className="border-t p-6 flex justify-end">
                    <button onClick={onClose} className="px-5 py-3 border rounded-xl hover:bg-gray-50">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReturnDetailsModal;