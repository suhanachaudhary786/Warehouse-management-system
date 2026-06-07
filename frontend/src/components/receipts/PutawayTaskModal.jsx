
// components/receipts/PutawayTaskModal.jsx
import { useState } from "react";
import { FaTimes, FaQrcode, FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";

function PutawayTaskModal({ open, onClose, task, onComplete }) {
    const [actualBinCode, setActualBinCode] = useState("");
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!open || !task) return null;

    const handleSubmit = async () => {
        if (!actualBinCode) {
            toast.error("Please enter or scan bin code");
            return;
        }

        setLoading(true);
        await onComplete(task._id, actualBinCode);
        setLoading(false);
        setActualBinCode("");
    };

    const suggestedBinCode = task.suggestedBin?.code || task.destinationBin?.code;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Complete Putaway</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                        <p className="text-sm text-gray-500">SKU</p>
                        <p className="font-semibold">{task.sku?.skuCode} - {task.sku?.name}</p>
                        <p className="text-sm text-gray-500 mt-2">Quantity</p>
                        <p className="font-semibold">{task.qty} units</p>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">Suggested Bin</label>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                            <p className="text-green-600 font-mono font-bold text-lg">{suggestedBinCode}</p>
                            <p className="text-xs text-green-600 mt-1">Slotting algorithm recommended this bin</p>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium">
                            Actual Bin Code {suggestedBinCode !== actualBinCode && actualBinCode && "(Override)"}
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={actualBinCode}
                                onChange={(e) => setActualBinCode(e.target.value.toUpperCase())}
                                placeholder="Scan or enter bin code"
                                className="flex-1 border rounded-xl p-3 focus:ring-2 focus:ring-amber-500"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setScanning(!scanning)}
                                className="px-4 bg-gray-100 rounded-xl hover:bg-gray-200"
                            >
                                <FaQrcode className="text-xl" />
                            </button>
                        </div>
                        {suggestedBinCode !== actualBinCode && actualBinCode && (
                            <p className="text-xs text-amber-600 mt-1">
                                ⚠️ You are overriding the suggested bin. Please ensure this bin is suitable.
                            </p>
                        )}
                    </div>

                    {task.destinationBin && (
                        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
                            <p className="text-sm text-gray-500">Bin Details</p>
                            <p className="font-mono">{task.destinationBin.code}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Available: {task.remainingVolume?.toFixed(0)} / {task.destinationBin.volumeCapacity} cu units
                            </p>
                        </div>
                    )}
                </div>

                <div className="border-t p-6 flex gap-3">
                    <button onClick={onClose} className="flex-1 px-5 py-3 border rounded-xl">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !actualBinCode}
                        className="flex-1 bg-green-500 text-white rounded-xl py-3 hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            "Processing..."
                        ) : (
                            <>
                                <FaCheckCircle /> Complete Putaway
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PutawayTaskModal;