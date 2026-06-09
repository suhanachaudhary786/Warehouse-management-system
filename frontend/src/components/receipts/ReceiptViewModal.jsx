
import { FaTimes, FaBox, FaCalendar, FaUser, FaBuilding, FaCheckCircle, FaClock, FaTruck, FaStickyNote } from "react-icons/fa";

function ReceiptViewModal({ open, onClose, receipt }) {
    if (!open || !receipt) return null;

    const getStatusColor = (status) => {
        const colors = {
            created: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
            receiving: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            putaway: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
            closed: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        };
        return colors[status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    const getStatusIcon = (status) => {
        const icons = {
            created: "📝",
            receiving: "📥",
            putaway: "📦",
            closed: "✅",
        };
        return icons[status] || "📋";
    };

    const getItemStatusColor = (item) => {
        const receivedQty = item.receivedQty || 0;
        if (receivedQty >= item.expectedQty) {
            return "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400";
        } else if (receivedQty > 0) {
            return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400";
        }
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    const getItemStatusText = (item) => {
        const receivedQty = item.receivedQty || 0;
        if (receivedQty >= item.expectedQty) return "Completed";
        if (receivedQty > 0) return "Partial";
        return "Pending";
    };

    const getItemStatusIcon = (item) => {
        const receivedQty = item.receivedQty || 0;
        if (receivedQty >= item.expectedQty) return "✅";
        if (receivedQty > 0) return "⚠️";
        return "⏳";
    };

    // Calculate statistics
    const totalItems = receipt.items?.length || 0;
    const totalExpected = receipt.items?.reduce((sum, item) => sum + item.expectedQty, 0) || 0;
    const totalReceived = receipt.items?.reduce((sum, item) => sum + (item.receivedQty || 0), 0) || 0;
    const completionPercentage = totalExpected > 0 ? (totalReceived / totalExpected) * 100 : 0;
    const completedItems = receipt.items?.filter(item => (item.receivedQty || 0) >= item.expectedQty).length || 0;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp">
                {/* Header - Responsive */}
                <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex justify-between items-center p-4 sm:p-6 border-b dark:border-slate-700">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                            Receipt Details
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Complete receipt information
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-2xl hover:text-gray-500 dark:hover:text-gray-400 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    >
                        <FaTimes className="text-lg sm:text-xl" />
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Receipt Header Card */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Receipt Number</p>
                                <p className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-gray-800 dark:text-white">
                                    {receipt.receiptNumber}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                                    <span className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(receipt.status)}`}>
                                        <span className="text-base sm:text-lg">{getStatusIcon(receipt.status)}</span>
                                        <span className="capitalize">{receipt.status}</span>
                                    </span>
                                </div>
                                <div className="sm:hidden">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Progress</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${completionPercentage}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-semibold">{Math.round(completionPercentage)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar - Desktop */}
                    <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Receipt Progress</span>
                            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{Math.round(completionPercentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>Expected: {totalExpected} units</span>
                            <span>Received: {totalReceived} units</span>
                        </div>
                    </div>

                    {/* Supplier Information Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                        <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                <FaBuilding className="text-amber-500" /> Supplier Information
                            </h3>
                        </div>
                        <div className="p-4 sm:p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaBuilding className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Supplier Name</p>
                                        <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-white">
                                            {receipt.supplier}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaCalendar className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Expected Date</p>
                                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                            {receipt.expectedDate ? new Date(receipt.expectedDate).toLocaleDateString() : "Not set"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Received By Card */}
                    {receipt.receivedBy && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                            <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                    <FaUser className="text-amber-500" /> Received By
                                </h3>
                            </div>
                            <div className="p-4 sm:p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center font-semibold">
                                        {receipt.receivedBy?.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white">{receipt.receivedBy?.name}</p>
                                        <p className="text-xs text-gray-500">{receipt.receivedBy?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Items Section */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                        <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                    <FaBox className="text-amber-500" /> Items
                                </h3>
                                <div className="flex gap-3 text-xs">
                                    <span className="text-gray-500">Total SKUs: {totalItems}</span>
                                    <span className="text-gray-500">Completed: {completedItems}</span>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-slate-800">
                                    <tr className="border-b dark:border-slate-700">
                                        <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                                            SKU Code
                                        </th>
                                        <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                                            Product Name
                                        </th>
                                        <th className="p-3 sm:p-4 text-right text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                                            Expected
                                        </th>
                                        <th className="p-3 sm:p-4 text-right text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                                            Received
                                        </th>
                                        <th className="p-3 sm:p-4 text-center text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receipt.items?.map((item, index) => (
                                        <tr key={index} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                                            <td className="p-3 sm:p-4 font-mono text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                {item.sku?.skuCode || "N/A"}
                                            </td>
                                            <td className="p-3 sm:p-4 text-sm sm:text-base text-gray-800 dark:text-white">
                                                {item.sku?.name || "N/A"}
                                            </td>
                                            <td className="p-3 sm:p-4 text-right font-medium text-sm text-gray-700 dark:text-gray-300">
                                                {item.expectedQty}
                                            </td>
                                            <td className="p-3 sm:p-4 text-right font-medium text-sm text-gray-700 dark:text-gray-300">
                                                {item.receivedQty || 0}
                                            </td>
                                            <td className="p-3 sm:p-4 text-center">
                                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getItemStatusColor(item)}`}>
                                                    <span>{getItemStatusIcon(item)}</span>
                                                    <span>{getItemStatusText(item)}</span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-slate-800 border-t dark:border-slate-700">
                                    <tr>
                                        <td colSpan="2" className="p-3 sm:p-4 text-right font-semibold text-sm text-gray-700 dark:text-gray-300">
                                            Totals:
                                        </td>
                                        <td className="p-3 sm:p-4 text-right font-bold text-sm text-gray-800 dark:text-white">
                                            {totalExpected}
                                        </td>
                                        <td className="p-3 sm:p-4 text-right font-bold text-sm text-gray-800 dark:text-white">
                                            {totalReceived}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Mobile Card View for Items */}
                        <div className="sm:hidden divide-y dark:divide-slate-700">
                            {receipt.items?.map((item, index) => (
                                <div key={index} className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                                {item.sku?.skuCode || "N/A"}
                                            </p>
                                            <p className="font-medium text-sm text-gray-800 dark:text-white mt-1">
                                                {item.sku?.name || "N/A"}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${getItemStatusColor(item)}`}>
                                            <span>{getItemStatusIcon(item)}</span>
                                            <span>{getItemStatusText(item)}</span>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <div>
                                            <p className="text-xs text-gray-500">Expected</p>
                                            <p className="font-semibold text-sm">{item.expectedQty}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Received</p>
                                            <p className="font-semibold text-sm">{item.receivedQty || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="p-4 bg-gray-50 dark:bg-slate-800">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-sm">Total Expected:</span>
                                    <span className="font-bold text-base text-amber-600">{totalExpected} units</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="font-semibold text-sm">Total Received:</span>
                                    <span className="font-bold text-base text-green-600">{totalReceived} units</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes Card */}
                    {receipt.notes && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                            <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                    <FaStickyNote className="text-amber-500" /> Notes
                                </h3>
                            </div>
                            <div className="p-4 sm:p-5">
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {receipt.notes}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Timeline Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                        <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                <FaClock className="text-amber-500" /> Timeline
                            </h3>
                        </div>
                        <div className="p-4 sm:p-5">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <FaCalendar className="text-gray-400 text-sm sm:text-base" />
                                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Created:</span>
                                    </div>
                                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-mono">
                                        {new Date(receipt.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <FaCheckCircle className="text-gray-400 text-sm sm:text-base" />
                                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Last Updated:</span>
                                    </div>
                                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-mono">
                                        {new Date(receipt.updatedAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer - Responsive */}
                <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t dark:border-slate-700 p-4 sm:p-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="border dark:border-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition text-sm sm:text-base order-2 sm:order-1"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="bg-gray-100 dark:bg-slate-800 border dark:border-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition text-sm sm:text-base order-1 sm:order-2 flex items-center gap-2 justify-center"
                    >
                        🖨️ Print
                    </button>
                </div>
            </div>
        </div>
    );
}


export default ReceiptViewModal;