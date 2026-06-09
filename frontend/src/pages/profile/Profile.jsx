
import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
    FaUser,
    FaEnvelope,
    FaUserTag,
    FaCalendar,
    FaShieldAlt,
    FaBuilding,
    FaPhone,
    FaMapMarker,
    FaEdit,
    FaCheckCircle,
    FaCopy
} from "react-icons/fa";
import toast from "react-hot-toast";

function Profile() {
    const [user, setUser] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userData);
    }, []);

    if (!user) return null;

    const getRoleColor = (role) => {
        return role === "manager"
            ? "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
            : "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
    };

    const getRoleIcon = (role) => {
        return role === "manager" ? "👨‍💼" : "👷";
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.charAt(0).toUpperCase();
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(`${type} copied to clipboard!`);
        setTimeout(() => setCopied(false), 2000);
    };

    // Mock additional user data (in real app, fetch from API)
    const additionalInfo = {
        joinDate: "2024-01-15",
        department: user.role === "manager" ? "Warehouse Management" : "Warehouse Operations",
        employeeId: user.role === "manager" ? "MGR-00" + Math.floor(Math.random() * 100) : "WRK-00" + Math.floor(Math.random() * 100),
        phone: "+91 XXXXX-XXXXX",
        location: "Mumbai Warehouse",
        lastLogin: new Date().toLocaleString(),
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
                <div className="p-3 sm:p-4 md:p-6 lg:p-8">
                    <div className="max-w-2xl mx-auto">
                        {/* Header */}
                        <div className="mb-6 md:mb-8">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                                My Profile
                            </h1>
                        </div>

                        {/* Profile Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border shadow-sm overflow-hidden">
                            {/* Cover Section */}
                            <div className="h-24 sm:h-32 bg-gradient-to-r from-amber-500 to-orange-500"></div>

                            {/* Avatar Section */}
                            <div className="relative px-4 sm:px-6 pb-6">
                                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 -mt-12 mb-4 sm:mb-6">
                                    <div className="relative">
                                        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center text-3xl sm:text-4xl font-bold border-4 border-white dark:border-slate-800 shadow-lg">
                                            {getInitials(user.name)}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white dark:border-slate-800">
                                            <FaCheckCircle className="text-white text-xs" />
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                                                {user.name}
                                            </h2>
                                            <button
                                                onClick={() => copyToClipboard(user.name, "Name")}
                                                className="text-gray-400 hover:text-gray-600 transition p-1"
                                                title="Copy name"
                                            >
                                                <FaCopy className="text-sm" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                                            <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getRoleColor(user.role)}`}>
                                                <span>{getRoleIcon(user.role)}</span>
                                                <span className="capitalize">{user.role}</span>
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400">
                                                <FaShieldAlt className="text-xs" />
                                                <span>Active</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* User Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Personal Information */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                            Personal Information
                                        </h3>

                                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl transition hover:bg-gray-100 dark:hover:bg-slate-700">
                                            <FaUser className="text-amber-500 mt-0.5 text-base sm:text-lg" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-800 dark:text-white">{user.name}</p>
                                                    <button
                                                        onClick={() => copyToClipboard(user.name, "Name")}
                                                        className="text-gray-400 hover:text-gray-600 transition"
                                                    >
                                                        <FaCopy className="text-xs" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl transition hover:bg-gray-100 dark:hover:bg-slate-700">
                                            <FaEnvelope className="text-amber-500 mt-0.5 text-base sm:text-lg" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-800 dark:text-white break-all">{user.email}</p>
                                                    <button
                                                        onClick={() => copyToClipboard(user.email, "Email")}
                                                        className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
                                                    >
                                                        <FaCopy className="text-xs" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl transition hover:bg-gray-100 dark:hover:bg-slate-700">
                                            <FaUserTag className="text-amber-500 mt-0.5 text-base sm:text-lg" />
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                                                <p className="font-medium capitalize text-gray-800 dark:text-white">{user.role}</p>
                                            </div>
                                        </div>

                                        {additionalInfo.phone && (
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl transition hover:bg-gray-100 dark:hover:bg-slate-700">
                                                <FaPhone className="text-amber-500 mt-0.5 text-base sm:text-lg" />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                                                    <p className="font-medium text-gray-800 dark:text-white">{additionalInfo.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Employment Information */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                            Employment Information
                                        </h3>

                                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl transition hover:bg-gray-100 dark:hover:bg-slate-700">
                                            <FaBuilding className="text-amber-500 mt-0.5 text-base sm:text-lg" />
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
                                                <p className="font-medium text-gray-800 dark:text-white">{additionalInfo.department}</p>
                                            </div>
                                        </div>


                                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl transition hover:bg-gray-100 dark:hover:bg-slate-700">
                                            <FaCalendar className="text-amber-500 mt-0.5 text-base sm:text-lg" />
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Join Date</p>
                                                <p className="font-medium text-gray-800 dark:text-white">
                                                    {new Date(additionalInfo.joinDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl transition hover:bg-gray-100 dark:hover:bg-slate-700">
                                            <FaMapMarker className="text-amber-500 mt-0.5 text-base sm:text-lg" />
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                                                <p className="font-medium text-gray-800 dark:text-white">{additionalInfo.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Last Login Info */}
                                <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <FaCalendar className="text-amber-500" />
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Last Login:</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {additionalInfo.lastLogin}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Stats */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-slate-800 rounded-xl border p-4 text-center">
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">✓</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Verified Account</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border p-4 text-center">
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">🔒</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2FA Disabled</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl border p-4 text-center">
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">⭐</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Premium Member</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default Profile;