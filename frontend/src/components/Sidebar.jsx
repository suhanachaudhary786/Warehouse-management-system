
import { useState, useEffect, useRef } from "react";
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
    FaBoxOpen,
    FaChevronDown,
    FaSignOutAlt,
    FaCog,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Sidebar({ isOpen = true, onClose }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userData);

        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Manager Menus (Full Access)
    const managerMenus = [
        { name: "Dashboard", path: "/dashboard", icon: <FaHome /> },
        { name: "Warehouse Map", path: "/map", icon: <FaMapMarkedAlt /> },
        { name: "Inventory", path: "/inventory", icon: <FaWarehouse /> },
        { name: "Orders", path: "/orders", icon: <FaClipboardList /> },
        { name: "Receipts", path: "/receipts", icon: <FaBoxOpen /> },
        { name: "Shipments", path: "/shipments", icon: <FaTruck /> },
        { name: "Returns", path: "/returns", icon: <FaUndo /> },
        { name: "Tasks", path: "/tasks", icon: <FaTasks /> },
        { name: "SKU Master", path: "/skus", icon: <FaBox /> },
        { name: "Bin Master", path: "/bins", icon: <FaUndo /> },
        { name: "Workers", path: "/workers", icon: <FaUsers /> },
    ];

    const workerMenus = [
        { name: "Dashboard", path: "/dashboard", icon: <FaHome /> },
        { name: "Receive Goods", path: "/receiving", icon: <FaBoxOpen /> },
        { name: "My Tasks", path: "/tasks", icon: <FaTasks /> },
        { name: "My Orders", path: "/orders", icon: <FaClipboardList /> },
        { name: "Shipments", path: "/shipments", icon: <FaTruck /> },
        { name: "Warehouse Map", path: "/map", icon: <FaMapMarkedAlt /> },
    ];

    const menus = user?.role === "manager" ? managerMenus : workerMenus;

    const getRoleBadgeColor = (role) => {
        return role === "manager"
            ? "bg-purple-100 text-purple-600"
            : "bg-blue-100 text-blue-600";
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.charAt(0).toUpperCase();
    };

    const handleMenuClick = () => {
        if (isMobile && onClose) {
            onClose();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.success("Logged out successfully");
        navigate("/login");
        window.location.reload();
    };

    const handleProfileClick = () => {
        setShowDropdown(false);
        navigate("/profile");
    };

    const handleSettingsClick = () => {
        setShowDropdown(false);
        navigate("/settings");
    };

    // Loading state
    if (!user) {
        return (
            <aside className="w-72 h-screen bg-white dark:bg-slate-900 border-r fixed left-0 top-0">
                <div className="p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>
            </aside>
        );
    }

    return (
        <aside
            className={`
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
                z-50
                transition-transform
                duration-300
                ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}
        >
            <div className="p-6 border-b dark:border-slate-700">
                <h1 className="text-2xl font-bold text-amber-500">WMS</h1>
                <p className="text-sm text-gray-500">Warehouse Management</p>
            </div>

            <div className="p-4 border-b dark:border-slate-700">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-xl transition w-full"
                    >
                        {/* Avatar */}
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center font-semibold text-lg">
                            {getInitials(user?.name)}
                        </div>

                        {/* User Info */}
                        <div className="hidden md:block text-left flex-1">
                            <h4 className="font-semibold text-sm dark:text-white">
                                {user?.name || "User"}
                            </h4>
                            <div className="flex items-center gap-1">
                                <p className={`text-xs px-2 py-0.5 rounded-full capitalize ${getRoleBadgeColor(user?.role)}`}>
                                    {user?.role || "Worker"}
                                </p>
                            </div>
                        </div>

                        <FaChevronDown className={`text-gray-400 text-xs transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                    </button>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border dark:border-slate-700 overflow-hidden z-50">
                            {/* User Info Section */}
                            <div className="p-4 border-b dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center text-xl font-semibold">
                                        {getInitials(user?.name)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold dark:text-white">{user?.name}</h4>
                                        <p className="text-sm text-gray-500">{user?.email}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize inline-block mt-1 ${getRoleBadgeColor(user?.role)}`}>
                                            {user?.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                                <button
                                    onClick={handleProfileClick}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                                >
                                    <FaUserCircle className="text-gray-400" />
                                    My Profile
                                </button>

                                {user?.role === "manager" && (
                                    <button
                                        onClick={handleSettingsClick}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                                    >
                                        <FaCog className="text-gray-400" />
                                        Settings
                                    </button>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="border-t dark:border-slate-700"></div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            >
                                <FaSignOutAlt />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Menus */}
            <div className="flex-1 p-4">
                {menus.map((menu) => (
                    <NavLink
                        key={menu.path}
                        to={menu.path}
                        onClick={handleMenuClick}
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
            <div className="p-4 border-t dark:border-slate-700">
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