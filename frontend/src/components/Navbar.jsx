
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import {
    FaUser,
    FaSignOutAlt,
    FaCog,
    FaUserCircle,
    FaChevronDown,
} from "react-icons/fa";
import toast from "react-hot-toast";

function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Get user from localStorage
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userData);
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

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.success("Logged out successfully");
        navigate("/");
    };


    const getRoleBadgeColor = (role) => {
        return role === "manager"
            ? "bg-purple-100 text-purple-600"
            : "bg-blue-100 text-blue-600";
    };


    const getInitials = (name) => {
        if (!name) return "U";
        return name.charAt(0).toUpperCase();
    };

    return (
        <header
            className="
                bg-white
                dark:bg-slate-900
                border-b
                px-4
                md:px-8
                py-4
                flex
                flex-col
                md:flex-row
                justify-between
                items-center
                gap-4
                sticky
                top-0
                z-40
            "
        >
            <div>
                <h1
                    className="
          text-2xl
          font-bold
          text-amber-500
          "
                >
                    WMS
                </h1>

                <p
                    className="
          text-sm
          text-gray-500
          "
                >
                    Warehouse Management
                </p>
            </div>


            {/* Right Section */}
            <div className="flex items-center gap-4">


                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="
                            flex
                            items-center
                            gap-3
                            hover:bg-gray-100
                            dark:hover:bg-slate-800
                            p-2
                            rounded-xl
                            transition
                        "
                    >
                        {/* Avatar */}
                        <div
                            className="
                                h-10
                                w-10
                                rounded-full
                                bg-gradient-to-r
                                from-amber-500
                                to-amber-600
                                text-white
                                flex
                                items-center
                                justify-center
                                font-semibold
                                text-lg
                            "
                        >
                            {getInitials(user?.name)}
                        </div>

                        {/* User Info */}
                        <div className="hidden md:block text-left">
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

                    {/* Dropdown Menu */}
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
                                    onClick={() => {
                                        setShowDropdown(false);
                                        navigate("/profile");
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                                >
                                    <FaUserCircle className="text-gray-400" />
                                    My Profile
                                </button>

                                {user?.role === "manager" && (
                                    <button
                                        onClick={() => {
                                            setShowDropdown(false);
                                            navigate("/settings");
                                        }}
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
        </header>
    );
}

export default Navbar;