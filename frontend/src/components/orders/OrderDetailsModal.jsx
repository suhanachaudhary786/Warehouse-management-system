
import { FaTimes, FaTruck, FaBox, FaUser, FaMapMarker, FaCalendar } from "react-icons/fa";

function OrderDetailsModal({ open, onClose, order }) {
    if (!open || !order) return null;

    const getStatusColor = (status) => {
        const colors = {
            created: "bg-gray-100 text-gray-600",
            allocated: "bg-blue-100 text-blue-600",
            picking: "bg-purple-100 text-purple-600",
            packed: "bg-yellow-100 text-yellow-600",
            shipped: "bg-green-100 text-green-600",
            delivered: "bg-emerald-100 text-emerald-600",
            cancelled: "bg-red-100 text-red-600",
        };
        return colors[status] || "bg-gray-100 text-gray-600";
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Order Details</h2>
                    <button onClick={onClose} className="text-2xl hover:text-gray-500">
                        <FaTimes />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Order Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500">Order Number</p>
                            <p className="text-xl font-mono font-bold">{order.orderNumber}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <FaUser /> Customer Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">{order.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p>{order.customerEmail || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p>{order.customerPhone || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Priority</p>
                                <p className={`font-medium ${order.priority === "high" ? "text-red-600" :
                                    order.priority === "medium" ? "text-yellow-600" : "text-green-600"
                                    }`}>
                                    {order.priority}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <FaMapMarker /> Shipping Address
                            </h3>
                            <p>
                                {order.shippingAddress.street}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                                {order.shippingAddress.country}
                            </p>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <FaBox /> Order Items
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="p-3 text-left text-sm">SKU Code</th>
                                        <th className="p-3 text-left text-sm">Product Name</th>
                                        <th className="p-3 text-right text-sm">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items?.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-3 font-mono text-sm">{item.sku?.skuCode}</td>
                                            <td className="p-3">{item.sku?.name}</td>
                                            <td className="p-3 text-right font-semibold">{item.qty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-slate-800">
                                    <tr>
                                        <td colSpan="2" className="p-3 text-right font-semibold">Total Items:</td>
                                        <td className="p-3 text-right font-bold">
                                            {order.items?.reduce((sum, i) => sum + i.qty, 0)} units
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <FaCalendar /> Timeline
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Created:</span>
                                <span>{new Date(order.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Last Updated:</span>
                                <span>{new Date(order.updatedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-2">Notes</h3>
                            <p className="text-gray-600">{order.notes}</p>
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

export default OrderDetailsModal;