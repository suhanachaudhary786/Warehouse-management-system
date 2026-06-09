
import { FaTimes, FaTruck, FaBox, FaUser, FaMapMarker, FaCalendar, FaClock, FaWeightHanging, FaRuler, FaMoneyBillWave, FaCheckCircle } from "react-icons/fa";

function ShipmentDetailsModal({ open, onClose, shipment }) {
    if (!open || !shipment) return null;

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
            label_generated: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
            picked_up: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
            in_transit: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
            out_for_delivery: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
            delivered: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            failed: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
            returned: "bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
        };
        return colors[status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: "📝",
            label_generated: "🏷️",
            picked_up: "📦",
            in_transit: "🚚",
            out_for_delivery: "🚛",
            delivered: "✅",
            failed: "❌",
            returned: "🔄",
        };
        return icons[status] || "📋";
    };

    const getTimelineIcon = (status) => {
        const icons = {
            label_generated: "🏷️",
            picked_up: "📦",
            in_transit: "🚚",
            out_for_delivery: "🚛",
            delivered: "✅",
        };
        return icons[status] || "📋";
    };

    const getStatusDisplay = (status) => {
        return status?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || status;
    };

    // Calculate delivery progress
    const getDeliveryProgress = () => {
        const statusOrder = ["pending", "label_generated", "picked_up", "in_transit", "out_for_delivery", "delivered"];
        const currentIndex = statusOrder.indexOf(shipment.status);
        if (currentIndex === -1) return 0;
        return (currentIndex / (statusOrder.length - 1)) * 100;
    };

    const progress = getDeliveryProgress();

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
                            Shipment Details
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Complete shipment tracking information
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
                    {/* Header Info Card */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Shipment Number</p>
                                <p className="text-lg sm:text-xl font-mono font-bold text-gray-800 dark:text-white">
                                    {shipment.shipmentNumber}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                                <span className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(shipment.status)}`}>
                                    <span className="text-base sm:text-lg">{getStatusIcon(shipment.status)}</span>
                                    <span className="capitalize">{getStatusDisplay(shipment.status)}</span>
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-amber-200 dark:border-slate-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tracking Number</p>
                            <p className="text-sm sm:text-base font-mono font-semibold text-gray-700 dark:text-gray-300">
                                {shipment.trackingNumber}
                            </p>
                        </div>
                    </div>

                    {/* Delivery Progress Bar */}
                    {shipment.status !== "delivered" && shipment.status !== "failed" && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Delivery Progress</span>
                                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                <div
                                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                                <span>Label</span>
                                <span>Picked</span>
                                <span>Transit</span>
                                <span>Out for Delivery</span>
                                <span>Delivered</span>
                            </div>
                        </div>
                    )}

                    {/* Order Information Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                        <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                <FaBox className="text-amber-500" /> Order Information
                            </h3>
                        </div>
                        <div className="p-4 sm:p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaBox className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Order Number</p>
                                        <p className="text-sm sm:text-base font-mono font-medium text-gray-800 dark:text-white">
                                            {shipment.order?.orderNumber}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <FaUser className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                            {shipment.order?.customerName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address Card */}
                    {shipment.shippingAddress && (
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
                                            {shipment.shippingAddress.street}<br />
                                            {shipment.shippingAddress.city}, {shipment.shippingAddress.state} {shipment.shippingAddress.zipCode}<br />
                                            {shipment.shippingAddress.country}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Package Details Card */}
                    {shipment.packageDetails && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                            <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                    <FaTruck className="text-amber-500" /> Package Details
                                </h3>
                            </div>
                            <div className="p-4 sm:p-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <FaWeightHanging className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                                {shipment.packageDetails.weight} kg
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <FaRuler className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Dimensions</p>
                                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                                {shipment.packageDetails.dimensions?.length} × {shipment.packageDetails.dimensions?.width} × {shipment.packageDetails.dimensions?.height} cm
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <FaTruck className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Carrier</p>
                                            <p className="text-sm sm:text-base capitalize text-gray-700 dark:text-gray-300">
                                                {shipment.carrier?.replace("_", " ")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <FaBox className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Service Type</p>
                                            <p className="text-sm sm:text-base capitalize text-gray-700 dark:text-gray-300">
                                                {shipment.serviceType}
                                            </p>
                                        </div>
                                    </div>
                                    {shipment.shippingCost && (
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <FaMoneyBillWave className="text-gray-400 mt-0.5 text-sm sm:text-base" />
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Shipping Cost</p>
                                                <p className="text-sm sm:text-base font-semibold text-green-600 dark:text-green-400">
                                                    ₹{shipment.shippingCost}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tracking Timeline Card */}
                    {shipment.statusHistory && shipment.statusHistory.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                            <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                    <FaClock className="text-amber-500" /> Tracking Timeline
                                </h3>
                            </div>
                            <div className="p-4 sm:p-5">
                                <div className="space-y-4 sm:space-y-6">
                                    {shipment.statusHistory.map((event, index) => (
                                        <div key={index} className="flex gap-3 sm:gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                                                    <span className="text-base sm:text-lg">{getTimelineIcon(event.status)}</span>
                                                </div>
                                                {index !== shipment.statusHistory.length - 1 && (
                                                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mx-auto my-1"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className="font-semibold text-sm sm:text-base capitalize text-gray-800 dark:text-white">
                                                    {getStatusDisplay(event.status)}
                                                </p>
                                                {event.description && (
                                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {event.description}
                                                    </p>
                                                )}
                                                {event.location && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                                                        📍 {event.location}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    {new Date(event.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Estimated Delivery Card */}
                    {(shipment.estimatedDelivery || shipment.actualDelivery) && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                            <div className="p-4 sm:p-5 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                                    <FaCalendar className="text-amber-500" /> Delivery Information
                                </h3>
                            </div>
                            <div className="p-4 sm:p-5">
                                <div className="space-y-3">
                                    {shipment.estimatedDelivery && (
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
                                            <div className="flex items-center gap-2">
                                                <FaCalendar className="text-gray-400 text-sm" />
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery:</span>
                                            </div>
                                            <span className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
                                                {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    {shipment.actualDelivery && (
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
                                            <div className="flex items-center gap-2">
                                                <FaCheckCircle className="text-green-500 text-sm" />
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Actual Delivery:</span>
                                            </div>
                                            <span className="text-sm sm:text-base font-semibold text-green-600 dark:text-green-400">
                                                {new Date(shipment.actualDelivery).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
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
                        className="bg-gray-100 dark:bg-slate-800 border dark:border-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition text-sm sm:text-base flex items-center gap-2 justify-center"
                    >
                        🖨️ Print
                    </button>
                </div>
            </div>
        </div>
    );
}


export default ShipmentDetailsModal;