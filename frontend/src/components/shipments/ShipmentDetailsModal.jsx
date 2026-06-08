
import { FaTimes, FaTruck, FaBox, FaUser, FaMapMarker, FaCalendar, FaClock } from "react-icons/fa";

function ShipmentDetailsModal({ open, onClose, shipment }) {
    if (!open || !shipment) return null;

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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Shipment Details</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Shipment Number</p>
                            <p className="font-mono font-semibold">{shipment.shipmentNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tracking Number</p>
                            <p className="font-mono">{shipment.trackingNumber}</p>
                        </div>
                    </div>

                    {/* Order Info */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <FaBox /> Order Information
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-sm text-gray-500">Order Number</p>
                                <p className="font-mono">{shipment.order?.orderNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Customer</p>
                                <p>{shipment.order?.customerName}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {shipment.shippingAddress && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <FaMapMarker /> Shipping Address
                            </h3>
                            <p>
                                {shipment.shippingAddress.street}<br />
                                {shipment.shippingAddress.city}, {shipment.shippingAddress.state} {shipment.shippingAddress.zipCode}<br />
                                {shipment.shippingAddress.country}
                            </p>
                        </div>
                    )}

                    {/* Package Details */}
                    {shipment.packageDetails && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3">Package Details</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-sm text-gray-500">Weight</p>
                                    <p>{shipment.packageDetails.weight} kg</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Dimensions</p>
                                    <p>
                                        {shipment.packageDetails.dimensions?.length} ×{" "}
                                        {shipment.packageDetails.dimensions?.width} ×{" "}
                                        {shipment.packageDetails.dimensions?.height} cm
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Carrier</p>
                                    <p className="capitalize">{shipment.carrier?.replace("_", " ")}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Service Type</p>
                                    <p className="capitalize">{shipment.serviceType}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Shipping Cost</p>
                                    <p className="font-semibold">₹{shipment.shippingCost}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tracking Timeline */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <FaClock /> Tracking Timeline
                        </h3>
                        <div className="space-y-4">
                            {shipment.statusHistory?.map((event, index) => (
                                <div key={index} className="flex gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                            <span className="text-lg">{getTimelineIcon(event.status)}</span>
                                        </div>
                                        {index !== shipment.statusHistory.length - 1 && (
                                            <div className="w-0.5 h-8 bg-gray-200 mx-auto"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold capitalize">{event.status?.replace("_", " ")}</p>
                                        <p className="text-sm text-gray-500">{event.description}</p>
                                        {event.location && (
                                            <p className="text-xs text-gray-400">📍 {event.location}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(event.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Estimated Delivery */}
                    {shipment.estimatedDelivery && (
                        <div className="border-t pt-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Estimated Delivery:</span>
                                <span className="font-semibold">
                                    {new Date(shipment.estimatedDelivery).toLocaleDateString()}
                                </span>
                            </div>
                            {shipment.actualDelivery && (
                                <div className="flex justify-between mt-2">
                                    <span className="text-gray-500">Actual Delivery:</span>
                                    <span className="font-semibold text-green-600">
                                        {new Date(shipment.actualDelivery).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
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

export default ShipmentDetailsModal;