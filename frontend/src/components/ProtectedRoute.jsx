
// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
    // Get user from localStorage
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Check if user is logged in
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Check if user has required role
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // User doesn't have permission, redirect to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    // Authorized - render children
    return children;
}

export default ProtectedRoute;