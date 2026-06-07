
import { useState, useEffect } from "react";
// Add this import at the top
import {
    FaBoxes,
    FaWarehouse,
    FaUsers,
    FaClipboardList,
    FaTruck,
    FaExclamationTriangle,
    FaTasks,
    FaCheckCircle,
    FaClock,
    FaArrowRight,
    FaBoxOpen
} from "react-icons/fa";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Link } from "react-router-dom";
import api from "../../api/api";

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [isManager, setIsManager] = useState(false);

    // Manager Stats
    const [managerStats, setManagerStats] = useState({
        totalSKUs: 0,
        totalBins: 0,
        totalWorkers: 0,
        totalInventory: 0,
        availableStock: 0,
        allocatedStock: 0,
    });

    // Worker Stats (Updated with receiving)
    const [workerStats, setWorkerStats] = useState({
        pendingTasks: 0,
        completedTasks: 0,
        myOrders: 0,
        myTasks: 0,
        pendingReceipts: 0,      // Add this
        pendingPutaway: 0,        // Add this
    });

    const [recentActivities, setRecentActivities] = useState([]);
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [binUtilization, setBinUtilization] = useState([]);
    const [myRecentTasks, setMyRecentTasks] = useState([]);
    const [pendingReceiptsList, setPendingReceiptsList] = useState([]); // Add this
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userData);
        setIsManager(userData.role === "manager");
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem("user") || "{}");
            const isManagerUser = userData.role === "manager";

            if (isManagerUser) {
                // MANAGER: Fetch all warehouse data (same as before)
                const [skusRes, binsRes, workersRes, inventoryRes] = await Promise.all([
                    api.get("/skus"),
                    api.get("/bins"),
                    api.get("/workers"),
                    api.get("/inventory"),
                ]);

                const skus = skusRes.data.data || [];
                const bins = binsRes.data.data || [];
                const workers = workersRes.data.data || [];
                const inventory = inventoryRes.data.data || [];

                const availableStock = inventory.filter(i => i.status === "available").reduce((sum, i) => sum + i.qty, 0);
                const allocatedStock = inventory.filter(i => i.status === "allocated").reduce((sum, i) => sum + i.qty, 0);

                setManagerStats({
                    totalSKUs: skus.length,
                    totalBins: bins.length,
                    totalWorkers: workers.length,
                    totalInventory: inventory.length,
                    availableStock,
                    allocatedStock,
                });

                const utilization = bins.map(bin => ({
                    code: bin.code,
                    utilization: ((bin.volumeCapacity - (bin.remainingVolume || 0)) / bin.volumeCapacity) * 100,
                }));
                setBinUtilization(utilization.slice(0, 5));

                const activities = inventory.slice(0, 5).map(item => ({
                    id: item._id,
                    message: `${item.sku?.name || "SKU"} updated - ${item.status}`,
                    time: new Date(item.updatedAt).toLocaleString(),
                    type: item.status,
                }));
                setRecentActivities(activities);

                const lowStock = inventory.filter(i => i.qty < 10 && i.qty > 0).map(item => ({
                    id: item._id,
                    sku: item.sku?.name,
                    qty: item.qty,
                    bin: item.bin?.code,
                }));
                setLowStockAlerts(lowStock);

            } else {
                // WORKER: Fetch their data including receipts
                const [tasksRes, ordersRes, receiptsRes, putawayRes] = await Promise.all([
                    api.get(`/tasks/worker/${userData._id}`),
                    api.get(`/orders/worker/${userData._id}`),
                    api.get("/receipts").catch(() => ({ data: { data: [] } })), // Receipts API
                    api.get("/receipts/putaway/tasks").catch(() => ({ data: { data: [] } })),
                ]);

                const tasks = tasksRes.data.data || [];
                const orders = ordersRes.data.data || [];
                const receipts = receiptsRes.data.data || [];
                const putawayTasks = putawayRes.data.data || [];

                const pendingTasks = tasks.filter(t => t.status !== "completed").length;
                const completedTasks = tasks.filter(t => t.status === "completed").length;

                // Receiving stats
                const pendingReceipts = receipts.filter(r => r.status === "created").length;
                const pendingPutaway = putawayTasks.filter(t => t.status === "pending").length;

                setWorkerStats({
                    pendingTasks,
                    completedTasks,
                    myOrders: orders.length,
                    myTasks: tasks.length,
                    pendingReceipts,
                    pendingPutaway,
                });

                setMyRecentTasks(tasks.slice(0, 5));
                setPendingReceiptsList(receipts.filter(r => r.status === "created").slice(0, 3));
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    const pieData = [
        { name: "Available", value: managerStats.availableStock },
        { name: "Allocated", value: managerStats.allocatedStock },
        { name: "Picked", value: 0 },
        { name: "Damaged", value: 0 },
    ];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                </div>
            </DashboardLayout>
        );
    }

    // MANAGER DASHBOARD (Same as before)
    if (isManager) {
        return (
            <DashboardLayout>
                <div className="mb-8">
                    <h1 className="text-4xl font-bold">Dashboard</h1>
                    <p className="text-gray-500 mt-2">Warehouse Overview & Analytics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total SKUs</p>
                                <h2 className="text-3xl font-bold">{managerStats.totalSKUs}</h2>
                            </div>
                            <FaBoxes className="text-amber-500 text-3xl" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Bins</p>
                                <h2 className="text-3xl font-bold">{managerStats.totalBins}</h2>
                            </div>
                            <FaWarehouse className="text-amber-500 text-3xl" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Active Workers</p>
                                <h2 className="text-3xl font-bold">{managerStats.totalWorkers}</h2>
                            </div>
                            <FaUsers className="text-amber-500 text-3xl" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Inventory Records</p>
                                <h2 className="text-3xl font-bold">{managerStats.totalInventory}</h2>
                            </div>
                            <FaClipboardList className="text-amber-500 text-3xl" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
                        <h3 className="text-lg font-semibold mb-4">Stock Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
                        <h3 className="text-lg font-semibold mb-4">Top Bin Utilization</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={binUtilization}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="code" />
                                <YAxis label={{ value: 'Utilization %', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Bar dataKey="utilization" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FaExclamationTriangle className="text-red-500" />
                            <h3 className="text-lg font-semibold">Low Stock Alerts</h3>
                        </div>
                        {lowStockAlerts.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No low stock items</p>
                        ) : (
                            <div className="space-y-3">
                                {lowStockAlerts.map((alert) => (
                                    <div key={alert.id} className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                                        <div>
                                            <p className="font-semibold">{alert.sku}</p>
                                            <p className="text-sm text-gray-500">Bin: {alert.bin}</p>
                                        </div>
                                        <span className="text-red-600 font-bold">{alert.qty} units left</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
                        {recentActivities.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No recent activities</p>
                        ) : (
                            <div className="space-y-3">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex justify-between items-center p-3 border-b">
                                        <div>
                                            <p className="text-sm">{activity.message}</p>
                                            <p className="text-xs text-gray-500">{activity.time}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${activity.type === "available" ? "bg-green-100 text-green-600" :
                                            activity.type === "allocated" ? "bg-blue-100 text-blue-600" :
                                                "bg-gray-100 text-gray-600"
                                            }`}>
                                            {activity.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            {/* Worker Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold">My Dashboard</h1>
                <p className="text-gray-500 mt-2">Welcome back, {user?.name}!</p>
            </div>

            {/* Worker Stats Cards - Updated with 6 cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 rounded-2xl border border-blue-200 p-4">
                    <p className="text-gray-500 text-sm">My Tasks</p>
                    <h2 className="text-2xl font-bold text-blue-600">{workerStats.myTasks}</h2>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 rounded-2xl border border-yellow-200 p-4">
                    <p className="text-gray-500 text-sm">Pending Tasks</p>
                    <h2 className="text-2xl font-bold text-yellow-600">{workerStats.pendingTasks}</h2>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 rounded-2xl border border-green-200 p-4">
                    <p className="text-gray-500 text-sm">Completed</p>
                    <h2 className="text-2xl font-bold text-green-600">{workerStats.completedTasks}</h2>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 rounded-2xl border border-orange-200 p-4">
                    <p className="text-gray-500 text-sm">To Receive</p>
                    <h2 className="text-2xl font-bold text-orange-600">{workerStats.pendingReceipts}</h2>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 rounded-2xl border border-purple-200 p-4">
                    <p className="text-gray-500 text-sm">To Putaway</p>
                    <h2 className="text-2xl font-bold text-purple-600">{workerStats.pendingPutaway}</h2>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 rounded-2xl border border-teal-200 p-4">
                    <p className="text-gray-500 text-sm">My Orders</p>
                    <h2 className="text-2xl font-bold text-teal-600">{workerStats.myOrders}</h2>
                </div>
            </div>

            {/* Worker Quick Actions - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Link to="/receiving" className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white hover:shadow-lg transition transform hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                        <div>
                            <FaBoxOpen className="text-2xl mb-2" />
                            <h3 className="text-lg font-semibold">Receive Goods</h3>
                            <p className="text-amber-100 text-sm mt-1">
                                {workerStats.pendingReceipts} pending receipts
                            </p>
                        </div>
                        <FaArrowRight className="text-2xl opacity-75" />
                    </div>
                </Link>

                <Link to="/tasks" className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white hover:shadow-lg transition transform hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                        <div>
                            <FaTasks className="text-2xl mb-2" />
                            <h3 className="text-lg font-semibold">My Tasks</h3>
                            <p className="text-blue-100 text-sm mt-1">
                                {workerStats.pendingTasks} pending tasks
                            </p>
                        </div>
                        <FaArrowRight className="text-2xl opacity-75" />
                    </div>
                </Link>

                <Link to="/map" className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-5 text-white hover:shadow-lg transition transform hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                        <div>
                            <FaWarehouse className="text-2xl mb-2" />
                            <h3 className="text-lg font-semibold">Warehouse Map</h3>
                            <p className="text-purple-100 text-sm mt-1">
                                Find bin locations
                            </p>
                        </div>
                        <FaArrowRight className="text-2xl opacity-75" />
                    </div>
                </Link>
            </div>

            {/* Pending Receipts Section - New */}
            {pendingReceiptsList.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border mb-8">
                    <div className="p-5 border-b flex justify-between items-center">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <FaBoxOpen className="text-amber-500" />
                            Pending Receipts
                        </h2>
                        <Link to="/receiving" className="text-amber-500 text-sm hover:underline">
                            View All →
                        </Link>
                    </div>
                    <div className="divide-y">
                        {pendingReceiptsList.map((receipt) => (
                            <div key={receipt._id} className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-mono font-medium">{receipt.receiptNumber}</p>
                                    <p className="text-sm text-gray-500">{receipt.supplier}</p>
                                    <p className="text-xs text-gray-400">{receipt.items?.length || 0} SKUs</p>
                                </div>
                                <Link
                                    to="/receiving"
                                    className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-600"
                                >
                                    Receive
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Tasks */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">My Recent Tasks</h2>
                </div>
                <div className="divide-y">
                    {myRecentTasks.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No tasks assigned yet
                        </div>
                    ) : (
                        myRecentTasks.map((task) => (
                            <div key={task._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700">
                                <div>
                                    <p className="font-semibold capitalize">{task.taskType} Task</p>
                                    <p className="text-sm text-gray-500">SKU: {task.sku?.name || "N/A"}</p>
                                    <p className="text-xs text-gray-400">Qty: {task.qty}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs px-2 py-1 rounded-full ${task.status === "completed"
                                        ? "bg-green-100 text-green-600"
                                        : "bg-yellow-100 text-yellow-600"
                                        }`}>
                                        {task.status === "completed" ? "✅ Completed" : "⏳ Pending"}
                                    </span>
                                    {task.completedAt && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(task.completedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {myRecentTasks.length > 0 && (
                    <div className="p-4 border-t text-center">
                        <Link to="/tasks" className="text-amber-500 hover:text-amber-600">
                            View All Tasks →
                        </Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default Dashboard;