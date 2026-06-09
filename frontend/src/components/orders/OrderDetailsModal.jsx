
import { FaTimes, FaTruck, FaBox, FaUser, FaMapMarker, FaCalendar, FaTag, FaPhone, FaEnvelope, FaFlag, FaClipboardList, FaCheckCircle, FaClock } from "react-icons/fa";

function OrderDetailsModal({ open, onClose, order }) {
    if (!open || !order) return null;

    const getStatusColor = (status) => {
        const colors = {
            created: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
            allocated: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            picking: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
            packed: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
            shipped: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            delivered: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
            cancelled: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        };
        return colors[status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "high": return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
            case "medium": return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
            case "low": return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
            default: return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20";
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            created: "📝",
            allocated: "📋",
            picking: "🤔",
            packed: "📦",
            shipped: "🚚",
            delivered: "✅",
            cancelled: "❌",
        };
        return icons[status] || "📋";
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case "high": return "🔴";
            case "medium": return "🟡";
            case "low": return "🟢";
            default: return "⚪";
        }
    };

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
                            Order Details
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Complete order information
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
                    {/* Order Header Card - Responsive */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                            <div className="flex-1">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">Order Number</p>
                                <div className="flex items-center gap-2">
                                    <FaTag className="text-amber-500 text-sm sm:text-base" />
                                    <p className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-gray-800 dark:text-white">
                                        {order.orderNumber}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                                    <span className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                                        <span className="text-base sm:text-lg">{getStatusIcon(order.status)}</span>
                                        <span className="capitalize">{order.status}</span>
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Priority</p>
                                    <span className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getPriorityColor(order.priority)} capitalize`}>
                                        <span>{getPriorityIcon(order.priority)}</span>
                                        <span>{order.priority}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                        <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                <FaUser className="text-amber-500" /> Customer Information
                            </h3>
                        </div>
                        <div className="p-4 sm:p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaUser className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                                        <p className="text-sm sm:text-base font-medium text-gray-800 dark:text-white">
                                            {order.customerName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaEnvelope className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
                                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-all">
                                            {order.customerEmail || "-"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaPhone className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                            {order.customerPhone || "-"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaFlag className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Priority Level</p>
                                        <p className={`text-sm sm:text-base font-semibold capitalize ${order.priority === "high" ? "text-red-600" : order.priority === "medium" ? "text-yellow-600" : "text-green-600"}`}>
                                            {order.priority}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address Card */}
                    {order.shippingAddress && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                            <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                    <FaMapMarker className="text-amber-500" /> Shipping Address
                                </h3>
                            </div>
                            <div className="p-4 sm:p-5">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaMapMarker className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div className="flex-1">
                                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {order.shippingAddress.street}<br />
                                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                                            {order.shippingAddress.country}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Items Card - Responsive Table */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                        <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                <FaBox className="text-amber-500" /> Order Items
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <div className="hidden sm:block">
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
                                                Quantity
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items?.map((item, index) => (
                                            <tr key={index} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                                                <td className="p-3 sm:p-4 font-mono text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                    {item.sku?.skuCode || "N/A"}
                                                </td>
                                                <td className="p-3 sm:p-4 text-sm sm:text-base text-gray-800 dark:text-white">
                                                    {item.sku?.name || "Unknown Product"}
                                                </td>
                                                <td className="p-3 sm:p-4 text-right font-semibold text-sm sm:text-base text-gray-800 dark:text-white">
                                                    {item.qty}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-slate-800 border-t dark:border-slate-700">
                                        <tr>
                                            <td colSpan="2" className="p-3 sm:p-4 text-right font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                                Total Items:
                                            </td>
                                            <td className="p-3 sm:p-4 text-right font-bold text-base sm:text-lg text-amber-600 dark:text-amber-400">
                                                {order.items?.reduce((sum, i) => sum + i.qty, 0)} units
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="sm:hidden divide-y dark:divide-slate-700">
                                {order.items?.map((item, index) => (
                                    <div key={index} className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                                    {item.sku?.skuCode || "N/A"}
                                                </p>
                                                <p className="font-medium text-sm text-gray-800 dark:text-white mt-1">
                                                    {item.sku?.name || "Unknown Product"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Quantity</p>
                                                <p className="font-bold text-lg text-amber-600 dark:text-amber-400">
                                                    {item.qty}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="p-4 bg-gray-50 dark:bg-slate-800">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Total Items:</span>
                                        <span className="font-bold text-base text-amber-600 dark:text-amber-400">
                                            {order.items?.reduce((sum, i) => sum + i.qty, 0)} units
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                        <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                <FaCalendar className="text-amber-500" /> Timeline
                            </h3>
                        </div>
                        <div className="p-4 sm:p-5">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <FaClock className="text-gray-400 text-sm sm:text-base" />
                                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Created:</span>
                                    </div>
                                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-mono">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <FaCheckCircle className="text-gray-400 text-sm sm:text-base" />
                                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Last Updated:</span>
                                    </div>
                                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-mono">
                                        {new Date(order.updatedAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes Card */}
                    {order.notes && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                            <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                    <FaClipboardList className="text-amber-500" /> Notes
                                </h3>
                            </div>
                            <div className="p-4 sm:p-5">
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {order.notes}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - Responsive */}
                <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t dark:border-slate-700 p-4 sm:p-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="border dark:border-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition text-sm sm:text-base"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="bg-gray-100 dark:bg-slate-800 border dark:border-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition text-sm sm:text-base order-1 sm:order-2"
                    >
                        🖨️ Print
                    </button>
                </div>
            </div>
        </div>
    );
}


export default OrderDetailsModal;