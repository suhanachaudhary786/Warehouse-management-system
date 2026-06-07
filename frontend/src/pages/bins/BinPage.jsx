

import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";
import BinFormModal from "../../components/bins/BinFormModal";
import { FaPlus, FaEdit, FaTrash, FaWarehouse } from "react-icons/fa";

function BinPage() {
    const [bins, setBins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedBin, setSelectedBin] = useState(null);

    const fetchBins = async () => {
        try {
            setLoading(true);
            const res = await api.get("/bins");
            setBins(res.data.data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBins();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Delete this bin?");
        if (!confirmDelete) return;

        try {
            await api.delete(`/bins/${id}`);
            fetchBins();
        } catch (error) {
            console.log(error);
            alert(error?.response?.data?.message || "Failed to delete bin");
        }
    };

    const filteredBins = bins.filter((bin) =>
        bin.code?.toLowerCase().includes(search.toLowerCase())
    );

    // Calculate stats
    const totalBins = bins.length;
    const availableBins = bins.filter((bin) => bin.status === "AVAILABLE").length;
    const fullBins = bins.filter((bin) => bin.status === "FULL").length;

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold">Bin Master</h1>
                    <p className="text-gray-500 mt-2">Manage warehouse bins</p>
                </div>

                <button
                    onClick={() => {
                        setSelectedBin(null);
                        setOpenModal(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition"
                >
                    <FaPlus />
                    Create Bin
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search Bin by code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-96 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500"
                />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6">
                    <p className="text-gray-500">Total Bins</p>
                    <h2 className="text-3xl font-bold">{totalBins}</h2>
                </div>

                <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6">
                    <p className="text-gray-500">Available</p>
                    <h2 className="text-3xl font-bold text-green-600">{availableBins}</h2>
                </div>

                <div className="bg-white dark:bg-slate-900 border rounded-2xl p-6">
                    <p className="text-gray-500">Full</p>
                    <h2 className="text-3xl font-bold text-orange-500">{fullBins}</h2>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-50 dark:bg-slate-800">
                                <th className="p-4 text-left">Bin Code</th>
                                <th className="p-4 text-left">Coordinates</th>
                                <th className="p-4 text-left">Volume</th>
                                <th className="p-4 text-left">Max Weight</th>
                                <th className="p-4 text-left">Remaining</th>
                                <th className="p-4 text-left">Handling</th>
                                <th className="p-4 text-left">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : filteredBins.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-gray-500">
                                        No bins found
                                    </td>
                                </tr>
                            ) : (
                                filteredBins.map((bin) => (
                                    <tr key={bin._id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <FaWarehouse className="text-amber-500" />
                                                <div>
                                                    <h3 className="font-semibold font-mono">
                                                        {bin.code}
                                                    </h3>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4 font-mono text-sm">
                                            ({bin.x || 0}, {bin.y || 0})
                                        </td>

                                        <td className="p-4">{bin.volumeCapacity} cu</td>

                                        <td className="p-4">{bin.maxWeight || 0} Kg</td>

                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span>{bin.remainingVolume || 0} cu</span>
                                                {bin.volumeCapacity && (
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                                        <div
                                                            className="bg-amber-500 h-1.5 rounded-full"
                                                            style={{
                                                                width: `${((bin.remainingVolume || 0) / bin.volumeCapacity) * 100}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1">
                                                {bin.allowedHandlingClasses?.slice(0, 2).map((item) => (
                                                    <span
                                                        key={item}
                                                        className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs"
                                                    >
                                                        {item.toLowerCase().replace("_", " ")}
                                                    </span>
                                                ))}
                                                {bin.allowedHandlingClasses?.length > 2 && (
                                                    <span className="text-xs text-gray-500">
                                                        +{bin.allowedHandlingClasses.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <span
                                                className={`
                                                    px-3 py-1 rounded-full text-xs font-medium
                                                    ${bin.status === "AVAILABLE"
                                                        ? "bg-green-100 text-green-600"
                                                        : "bg-orange-100 text-orange-600"
                                                    }
                                                `}
                                            >
                                                {bin.status}
                                            </span>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex justify-center gap-4">
                                                <button
                                                    onClick={() => {
                                                        setSelectedBin(bin);
                                                        setOpenModal(true);
                                                    }}
                                                    className="text-blue-500 hover:text-blue-700 transition"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(bin._id)}
                                                    className="text-red-500 hover:text-red-700 transition"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <BinFormModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setSelectedBin(null);
                }}
                selectedBin={selectedBin}
                refresh={fetchBins}
            />
        </DashboardLayout>
    );
}

export default BinPage;