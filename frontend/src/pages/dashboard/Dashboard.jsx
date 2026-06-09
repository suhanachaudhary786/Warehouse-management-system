
import { useState, useEffect } from "react";
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
        pendingReceipts: 0,
        pendingPutaway: 0,
    });

    const [recentActivities, setRecentActivities] = useState([]);
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [binUtilization, setBinUtilization] = useState([]);
    const [myRecentTasks, setMyRecentTasks] = useState([]);
    const [pendingReceiptsList, setPendingReceiptsList] = useState([]);
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
                const [tasksRes, ordersRes, receiptsRes, putawayRes] = await Promise.all([
                    api.get(`/tasks/worker/${userData._id}`),
                    api.get(`/orders/worker/${userData._id}`),
                    api.get("/receipts").catch(() => ({ data: { data: [] } })),
                    api.get("/receipts/putaway/tasks").catch(() => ({ data: { data: [] } })),
                ]);

                const tasks = tasksRes.data.data || [];
                const orders = ordersRes.data.data || [];
                const receipts = receiptsRes.data.data || [];
                const putawayTasks = putawayRes.data.data || [];

                const pendingTasks = tasks.filter(t => t.status !== "completed").length;
                const completedTasks = tasks.filter(t => t.status === "completed").length;
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

    // MANAGER DASHBOARD (Responsive)
    if (isManager) {
        return (
            <DashboardLayout>
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">Dashboard</h1>
                    <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-base">Warehouse Overview & Analytics</p>
                </div>

                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl border p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs md:text-sm">Total SKUs</p>
                                <h2 className="text-2xl md:text-3xl font-bold">{managerStats.totalSKUs}</h2>
                            </div>
                            <FaBoxes className="text-amber-500 text-2xl md:text-3xl" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl border p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs md:text-sm">Total Bins</p>
                                <h2 className="text-2xl md:text-3xl font-bold">{managerStats.totalBins}</h2>
                            </div>
                            <FaWarehouse className="text-amber-500 text-2xl md:text-3xl" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl border p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs md:text-sm">Active Workers</p>
                                <h2 className="text-2xl md:text-3xl font-bold">{managerStats.totalWorkers}</h2>
                            </div>
                            <FaUsers className="text-amber-500 text-2xl md:text-3xl" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl border p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-xs md:text-sm">Inventory Records</p>
                                <h2 className="text-2xl md:text-3xl font-bold">{managerStats.totalInventory}</h2>
                            </div>
                            <FaClipboardList className="text-amber-500 text-2xl md:text-3xl" />
                        </div>
                    </div>
                </div>

                {/* Charts - Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-6 mb-6 md:mb-8">
                    <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl border p-4 md:p-6">
                        <h3 className="text-base md:text-lg font-semibold mb-4">Stock Distribution</h3>
                        <div className="w-full h-64 md:h-72 lg:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => {
                                            const percentage = (percent * 100).toFixed(0);
                                            return window.innerWidth < 640 ? `${percentage}%` : `${name} ${percentage}%`;
                                        }}
                                        outerRadius={window.innerWidth < 640 ? 60 : 80}
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
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl border p-4 md:p-6">
                        <h3 className="text-base md:text-lg font-semibold mb-4">Top Bin Utilization</h3>
                        <div className="w-full h-64 md:h-72 lg:h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={binUtilization}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="code"
                                        tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                                        interval={window.innerWidth < 640 ? 0 : 0}
                                    />
                                    <YAxis
                                        label={{
                                            value: 'Utilization %',
                                            angle: -90,
                                            position: 'insideLeft',
                                            style: { fontSize: window.innerWidth < 640 ? 10 : 12 }
                                        }}
                                        tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="utilization" fill="#f59e0b" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Alerts and Activities - Responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl border p-4 md:p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FaExclamationTriangle className="text-red-500 text-lg md:text-xl" />
                            <h3 className="text-base md:text-lg font-semibold">Low Stock Alerts</h3>
                        </div>
                        {lowStockAlerts.length === 0 ? (
                            <p className="text-gray-500 text-center py-6 md:py-8 text-sm md:text-base">No low stock items</p>
                        ) : (
                            <div className="space-y-3">
                                {lowStockAlerts.map((alert) => (
                                    <div key={alert.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-red-50 rounded-xl gap-2">
                                        <div>
                                            <p className="font-semibold text-sm md:text-base">{alert.sku}</p>
                                            <p className="text-xs md:text-sm text-gray-500">Bin: {alert.bin}</p>
                                        </div>
                                        <span className="text-red-600 font-bold text-sm md:text-base">{alert.qty} units left</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl border p-4 md:p-6">
                        <h3 className="text-base md:text-lg font-semibold mb-4">Recent Activities</h3>
                        {recentActivities.length === 0 ? (
                            <p className="text-gray-500 text-center py-6 md:py-8 text-sm md:text-base">No recent activities</p>
                        ) : (
                            <div className="space-y-3">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border-b gap-2">
                                        <div>
                                            <p className="text-xs md:text-sm">{activity.message}</p>
                                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full w-fit ${activity.type === "available" ? "bg-green-100 text-green-600" :
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

    // WORKER DASHBOARD (Fully Responsive)
    return (
        <DashboardLayout>
            {/* Worker Header */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">My Dashboard</h1>
                <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-base">Welcome back, {user?.name}!</p>
            </div>

            {/* Worker Stats Cards - Fully Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 rounded-xl md:rounded-2xl border border-blue-200 p-3 md:p-4">
                    <p className="text-gray-500 text-xs md:text-sm">My Tasks</p>
                    <h2 className="text-xl md:text-2xl font-bold text-blue-600">{workerStats.myTasks}</h2>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 rounded-xl md:rounded-2xl border border-yellow-200 p-3 md:p-4">
                    <p className="text-gray-500 text-xs md:text-sm">Pending Tasks</p>
                    <h2 className="text-xl md:text-2xl font-bold text-yellow-600">{workerStats.pendingTasks}</h2>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 rounded-xl md:rounded-2xl border border-green-200 p-3 md:p-4">
                    <p className="text-gray-500 text-xs md:text-sm">Completed</p>
                    <h2 className="text-xl md:text-2xl font-bold text-green-600">{workerStats.completedTasks}</h2>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 rounded-xl md:rounded-2xl border border-orange-200 p-3 md:p-4">
                    <p className="text-gray-500 text-xs md:text-sm">To Receive</p>
                    <h2 className="text-xl md:text-2xl font-bold text-orange-600">{workerStats.pendingReceipts}</h2>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 rounded-xl md:rounded-2xl border border-purple-200 p-3 md:p-4">
                    <p className="text-gray-500 text-xs md:text-sm">To Putaway</p>
                    <h2 className="text-xl md:text-2xl font-bold text-purple-600">{workerStats.pendingPutaway}</h2>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 rounded-xl md:rounded-2xl border border-teal-200 p-3 md:p-4">
                    <p className="text-gray-500 text-xs md:text-sm">My Orders</p>
                    <h2 className="text-xl md:text-2xl font-bold text-teal-600">{workerStats.myOrders}</h2>
                </div>
            </div>

            {/* Worker Quick Actions - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                <Link to="/receiving" className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl md:rounded-2xl p-4 md:p-5 text-white hover:shadow-lg transition transform hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                        <div>
                            <FaBoxOpen className="text-xl md:text-2xl mb-1 md:mb-2" />
                            <h3 className="text-base md:text-lg font-semibold">Receive Goods</h3>
                            <p className="text-amber-100 text-xs md:text-sm mt-1">
                                {workerStats.pendingReceipts} pending receipts
                            </p>
                        </div>
                        <FaArrowRight className="text-xl md:text-2xl opacity-75" />
                    </div>
                </Link>

                <Link to="/tasks" className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl md:rounded-2xl p-4 md:p-5 text-white hover:shadow-lg transition transform hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                        <div>
                            <FaTasks className="text-xl md:text-2xl mb-1 md:mb-2" />
                            <h3 className="text-base md:text-lg font-semibold">My Tasks</h3>
                            <p className="text-blue-100 text-xs md:text-sm mt-1">
                                {workerStats.pendingTasks} pending tasks
                            </p>
                        </div>
                        <FaArrowRight className="text-xl md:text-2xl opacity-75" />
                    </div>
                </Link>

                <Link to="/map" className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-5 text-white hover:shadow-lg transition transform hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                        <div>
                            <FaWarehouse className="text-xl md:text-2xl mb-1 md:mb-2" />
                            <h3 className="text-base md:text-lg font-semibold">Warehouse Map</h3>
                            <p className="text-purple-100 text-xs md:text-sm mt-1">
                                Find bin locations
                            </p>
                        </div>
                        <FaArrowRight className="text-xl md:text-2xl opacity-75" />
                    </div>
                </Link>
            </div>

            {/* Pending Receipts Section - Responsive */}
            {pendingReceiptsList.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border mb-6 md:mb-8">
                    <div className="p-4 md:p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                            <FaBoxOpen className="text-amber-500" />
                            Pending Receipts
                        </h2>
                        <Link to="/receiving" className="text-amber-500 text-sm hover:underline">
                            View All →
                        </Link>
                    </div>
                    <div className="divide-y">
                        {pendingReceiptsList.map((receipt) => (
                            <div key={receipt._id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <p className="font-mono font-medium text-sm md:text-base">{receipt.receiptNumber}</p>
                                    <p className="text-xs md:text-sm text-gray-500">{receipt.supplier}</p>
                                    <p className="text-xs text-gray-400">{receipt.items?.length || 0} SKUs</p>
                                </div>
                                <Link
                                    to="/receiving"
                                    className="bg-amber-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm hover:bg-amber-600 w-full sm:w-auto text-center"
                                >
                                    Receive
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Tasks - Responsive */}
            <div className="bg-white dark:bg-slate-800 rounded-xl md:rounded-2xl border">
                <div className="p-4 md:p-6 border-b">
                    <h2 className="text-lg md:text-xl font-semibold">My Recent Tasks</h2>
                </div>
                <div className="divide-y">
                    {myRecentTasks.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm md:text-base">
                            No tasks assigned yet
                        </div>
                    ) : (
                        myRecentTasks.map((task) => (
                            <div key={task._id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 dark:hover:bg-slate-700 gap-3">
                                <div>
                                    <p className="font-semibold capitalize text-sm md:text-base">{task.taskType} Task</p>
                                    <p className="text-xs md:text-sm text-gray-500">SKU: {task.sku?.name || "N/A"}</p>
                                    <p className="text-xs text-gray-400">Qty: {task.qty}</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <span className={`text-xs px-2 py-1 rounded-full inline-block ${task.status === "completed"
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
                        <Link to="/tasks" className="text-amber-500 hover:text-amber-600 text-sm md:text-base">
                            View All Tasks →
                        </Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default Dashboard;