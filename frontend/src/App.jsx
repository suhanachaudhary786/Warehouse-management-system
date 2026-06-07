
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import WarehouseMap from "./pages/map/WarehouseMap";
import Workers from "./pages/worker/Workers";
import SKUPage from "./pages/sku/SKUPage";
import BinPage from "./pages/bins/BinPage";
import InventoryPage from "./pages/inventory/InventoryPage";
import Orders from "./pages/order/Orders";
import { Toaster } from "react-hot-toast";
import Tasks from "./pages/task/Tasks";
import Shipments from "./pages/shipping/Shipments";
import Returns from "./pages/return/Returns";
import Profile from "./pages/profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Receipts from "./pages/receipt/Receipts";

// Import Worker-specific pages
import WorkerTasks from "./pages/worker/WorkerTasks";
import WorkerOrders from "./pages/worker/WorkerOrders";
import WorkerShipments from "./pages/worker/WorkerShipments";
import WorkerReceiving from "./pages/worker/WorkerReceiving";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Common Routes - Both Manager & Worker */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["manager", "worker"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/map"
          element={
            <ProtectedRoute allowedRoles={["manager", "worker"]}>
              <WarehouseMap />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["manager", "worker"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Manager Only Routes */}
        <Route
          path="/skus"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <SKUPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bins"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <BinPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workers"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Workers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/returns"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <Returns />
            </ProtectedRoute>
          }
        />

        <Route path="/receipts" element={
          <ProtectedRoute allowedRoles={["manager"]}>
            <Receipts />
          </ProtectedRoute>
        } />

        <Route path="/receiving" element={
          <ProtectedRoute allowedRoles={["worker"]}>
            <WorkerReceiving />
          </ProtectedRoute>
        } />


        {/* Role-Based Routes - Different component based on role */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["manager", "worker"]}>
              {userRole === "manager" ? <Orders /> : <WorkerOrders />}
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute allowedRoles={["manager", "worker"]}>
              {userRole === "manager" ? <Tasks /> : <WorkerTasks />}
            </ProtectedRoute>
          }
        />

        <Route
          path="/shipments"
          element={
            <ProtectedRoute allowedRoles={["manager", "worker"]}>
              {userRole === "manager" ? <Shipments /> : <WorkerShipments />}
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;