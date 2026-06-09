
import { useNavigate } from "react-router-dom";
import { FaUserSecret, FaUser, FaWarehouse } from "react-icons/fa";

function RoleSelection() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl shadow-lg mb-6">
                        <FaWarehouse className="text-white text-5xl" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">WMS System</h1>
                    <p className="text-xl text-gray-400">Select your portal to continue</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Manager Card */}
                    <div
                        onClick={() => navigate("/manager-login")}
                        className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-8 cursor-pointer transform transition hover:scale-105 hover:shadow-2xl border border-purple-500/30"
                    >
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaUserSecret className="text-white text-4xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Manager Portal</h2>
                            <p className="text-gray-300 mb-6">
                                Full access to warehouse management, inventory control, and team administration
                            </p>
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg inline-block">
                                Login as Manager
                            </div>
                        </div>
                    </div>

                    {/* Worker Card */}
                    <div
                        onClick={() => navigate("/worker-login")}
                        className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-2xl p-8 cursor-pointer transform transition hover:scale-105 hover:shadow-2xl border border-blue-500/30"
                    >
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaUser className="text-white text-4xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">Worker Portal</h2>
                            <p className="text-gray-300 mb-6">
                                Access to assigned tasks, order picking, shipping, and warehouse operations
                            </p>
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg inline-block">
                                Login as Worker
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoleSelection;