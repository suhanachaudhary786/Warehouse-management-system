
// pages/Profile.jsx
import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { FaUser, FaEnvelope, FaUserTag } from "react-icons/fa";

function Profile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userData);
    }, []);

    if (!user) return null;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">My Profile</h1>

                <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-center text-3xl font-bold">
                            {user.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <span className={`px-3 py-1 rounded-full text-sm capitalize ${user.role === "manager" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}>
                                {user.role}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                            <FaUser className="text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-medium">{user.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                            <FaEnvelope className="text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Email Address</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                            <FaUserTag className="text-gray-400" />
                            <div>
                                <p className="text-sm text-gray-500">Role</p>
                                <p className="font-medium capitalize">{user.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default Profile;