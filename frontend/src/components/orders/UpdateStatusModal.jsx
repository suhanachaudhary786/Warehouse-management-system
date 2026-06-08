
import { useState } from "react";
import { FaTimes } from "react-icons/fa";

function UpdateStatusModal({ open, onClose, order, onUpdate }) {
    const [selectedStatus, setSelectedStatus] = useState(order?.status || "created");
    const [loading, setLoading] = useState(false);

    if (!open || !order) return null;

    const statusOptions = [
        { value: "created", label: "Created", color: "gray", icon: "📝" },
        { value: "allocated", label: "Allocated", color: "blue", icon: "📋" },
        { value: "picking", label: "Picking", color: "purple", icon: "🤔" },
        { value: "packed", label: "Packed", color: "yellow", icon: "📦" },
        { value: "shipped", label: "Shipped", color: "green", icon: "🚚" },
        { value: "delivered", label: "Delivered", color: "emerald", icon: "✅" },
        { value: "cancelled", label: "Cancelled", color: "red", icon: "❌" },
    ];

    const handleSubmit = async () => {
        setLoading(true);
        await onUpdate(order._id, selectedStatus);
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Update Order Status</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4">
                        Order: <span className="font-mono font-semibold">{order.orderNumber}</span>
                    </p>

                    <div className="space-y-3">
                        {statusOptions.map((status) => (
                            <label
                                key={status.value}
                                className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${selectedStatus === status.value
                                    ? `border-${status.color}-500 bg-${status.color}-50`
                                    : "hover:bg-gray-50"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value={status.value}
                                    checked={selectedStatus === status.value}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-4 h-4"
                                />
                                <span className="text-xl">{status.icon}</span>
                                <span className="font-medium">{status.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="border-t p-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-3 border rounded-xl">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || selectedStatus === order.status}
                        className="px-5 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50"
                    >
                        {loading ? "Updating..." : "Update Status"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UpdateStatusModal;