
import { useState, useEffect } from "react";
import {
    FaBox,
    FaClipboardList,
    FaMapMarkedAlt,
    FaUsers,
    FaWarehouse,
    FaUndo,
    FaTruck,
    FaTasks,
    FaHome,
    FaUserCircle,
    FaBoxOpen
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setUserRole(user.role);
        setUserName(user.name || (user.role === "manager" ? "Manager" : "Worker"));
    }, []);

    // Manager Menus (Full Access)
    const managerMenus = [
        { name: "Dashboard", path: "/dashboard", icon: <FaHome /> },
        { name: "Warehouse Map", path: "/map", icon: <FaMapMarkedAlt /> },
        { name: "Inventory", path: "/inventory", icon: <FaWarehouse /> },
        { name: "Orders", path: "/orders", icon: <FaClipboardList /> },
        { name: "Receipts (ASN)", path: "/receipts", icon: <FaBoxOpen /> },
        { name: "Shipments", path: "/shipments", icon: <FaTruck /> },
        { name: "Returns", path: "/returns", icon: <FaUndo /> },
        { name: "Tasks", path: "/tasks", icon: <FaTasks /> },
        { name: "SKU Master", path: "/skus", icon: <FaBox /> },
        { name: "Bin Master", path: "/bins", icon: <FaUndo /> },
        { name: "Workers", path: "/workers", icon: <FaUsers /> },
    ];

    const workerMenus = [
        { name: "Dashboard", path: "/dashboard", icon: <FaHome /> },
        { name: "Receive Goods", path: "/receiving", icon: <FaBoxOpen /> },  // Add this
        { name: "My Tasks", path: "/tasks", icon: <FaTasks /> },
        { name: "My Orders", path: "/orders", icon: <FaClipboardList /> },
        { name: "Shipments", path: "/shipments", icon: <FaTruck /> },
        { name: "Warehouse Map", path: "/map", icon: <FaMapMarkedAlt /> },
    ];

    const menus = userRole === "manager" ? managerMenus : workerMenus;

    // Get role badge color
    const getRoleBadgeColor = () => {
        return userRole === "manager"
            ? "bg-purple-100 text-purple-600"
            : "bg-blue-100 text-blue-600";
    };

    // Get avatar color
    const getAvatarColor = () => {
        return userRole === "manager"
            ? "from-purple-500 to-purple-600"
            : "from-blue-500 to-blue-600";
    };

    return (
        <aside
            className="
                w-72
                h-screen
                bg-white
                dark:bg-slate-900
                border-r
                fixed
                left-0
                top-0
                overflow-y-auto
                flex
                flex-col
            "
        >
            {/* Logo Section */}
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-amber-500">WMS</h1>
                <p className="text-sm text-gray-500">Warehouse Management</p>
            </div>

            {/* User Info Section */}
            <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                    <div className={`
                        h-12 w-12 rounded-full bg-gradient-to-r ${getAvatarColor()} 
                        text-white flex items-center justify-center text-lg font-semibold
                    `}>
                        {userName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-white">
                            {userName}
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRoleBadgeColor()}`}>
                            {userRole || "Loading..."}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Menus */}
            <div className="flex-1 p-4">
                {menus.map((menu) => (
                    <NavLink
                        key={menu.path}
                        to={menu.path}
                        className={({ isActive }) =>
                            `
                                flex
                                items-center
                                gap-3
                                px-4
                                py-3
                                rounded-xl
                                mb-1
                                transition
                                ${isActive
                                ? "bg-amber-500 text-white shadow-md"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                            }
                            `
                        }
                    >
                        <span className="text-lg">{menu.icon}</span>
                        <span className="text-sm font-medium">{menu.name}</span>
                    </NavLink>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
                <div className="text-center">
                    <p className="text-xs text-gray-400">
                        © 2026 WMS System
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Version 103
                    </p>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;