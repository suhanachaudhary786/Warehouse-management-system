
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

function UpdateStatusModal({ open, onClose, shipment, onUpdate }) {
    const [selectedStatus, setSelectedStatus] = useState(shipment?.status || "pending");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    if (!open || !shipment) return null;

    const statusOptions = [
        { value: "label_generated", label: "Label Generated", color: "blue" },
        { value: "picked_up", label: "Picked Up", color: "purple" },
        { value: "in_transit", label: "In Transit", color: "yellow" },
        { value: "out_for_delivery", label: "Out for Delivery", color: "orange" },
        { value: "delivered", label: "Delivered", color: "green" },
        { value: "failed", label: "Failed", color: "red" },
    ];

    const handleSubmit = async () => {
        setLoading(true);
        await onUpdate(shipment._id, {
            status: selectedStatus,
            location,
            description,
        });
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Update Shipment Status</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block mb-2 font-medium">Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., Mumbai Hub, Delhi Sort Center"
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            placeholder="Additional details about the shipment..."
                            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                </div>

                <div className="border-t p-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-3 border rounded-xl">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
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