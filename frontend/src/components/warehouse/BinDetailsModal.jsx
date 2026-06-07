
// components/warehouse/BinDetailsModal.jsx
import { useState } from "react";
import { FaTimes, FaBox, FaWeight, FaChartLine, FaArchive } from "react-icons/fa";

function BinDetailsModal({ open, onClose, bin, inventory, refresh }) {
    const [loading, setLoading] = useState(false);

    if (!open || !bin) return null;

    // Get inventory items in this bin
    const binInventory = inventory.filter(
        (item) => item.bin?._id === bin._id || item.bin === bin._id
    );

    const totalItems = binInventory.reduce((sum, item) => sum + item.qty, 0);
    const totalWeight = binInventory.reduce(
        (sum, item) => sum + (item.sku?.weight || 0) * item.qty,
        0
    );
    const utilization = (totalItems / (bin.volumeCapacity || 1)) * 100;

    const getUtilizationColor = () => {
        if (utilization >= 90) return "text-red-600";
        if (utilization >= 70) return "text-orange-600";
        if (utilization >= 40) return "text-yellow-600";
        return "text-green-600";
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Bin Details</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Bin Code</p>
                            <p className="text-xl font-mono font-bold">{bin.code}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${bin.status === "AVAILABLE"
                                        ? "bg-green-100 text-green-600"
                                        : bin.status === "FULL"
                                            ? "bg-red-100 text-red-600"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                            >
                                {bin.status || "AVAILABLE"}
                            </span>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">Location</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-sm text-gray-500">X Coordinate</p>
                                <p className="font-mono">{bin.x || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Y Coordinate</p>
                                <p className="font-mono">{bin.y || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Capacity */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">Capacity & Utilization</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Volume Capacity:</span>
                                <span className="font-semibold">{bin.volumeCapacity} units</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Current Stock:</span>
                                <span className="font-semibold">{totalItems} units</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Max Weight:</span>
                                <span className="font-semibold">{bin.maxWeight || 0} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Current Weight:</span>
                                <span className="font-semibold">{totalWeight.toFixed(2)} kg</span>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-gray-500">Utilization:</span>
                                    <span className={`font-semibold ${getUtilizationColor()}`}>
                                        {utilization.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-amber-500 h-2 rounded-full"
                                        style={{ width: `${Math.min(utilization, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Handling Classes */}
                    {bin.allowedHandlingClasses?.length > 0 && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">Allowed Handling Classes</h3>
                            <div className="flex flex-wrap gap-2">
                                {bin.allowedHandlingClasses.map((cls) => (
                                    <span
                                        key={cls}
                                        className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs"
                                    >
                                        {cls}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Inventory in this bin */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <FaArchive /> Items in this Bin
                        </h3>
                        {binInventory.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No items in this bin</p>
                        ) : (
                            <div className="space-y-2">
                                {binInventory.map((item) => (
                                    <div
                                        key={item._id}
                                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-xl"
                                    >
                                        <div>
                                            <p className="font-medium">{item.sku?.name}</p>
                                            <p className="text-xs text-gray-500 font-mono">{item.sku?.skuCode}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{item.qty} units</p>
                                            <p className="text-xs text-gray-500 capitalize">{item.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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

export default BinDetailsModal;