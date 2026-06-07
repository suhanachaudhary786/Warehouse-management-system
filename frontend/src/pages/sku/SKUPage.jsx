
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/api";

import SKUFormModal from "../../components/sku/SKUFormModal";

import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaBarcode,
} from "react-icons/fa";

function SKUPage() {
    const [skus, setSkus] = useState([]);

    const [loading, setLoading] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [openModal, setOpenModal] =
        useState(false);

    const [selectedSku, setSelectedSku] =
        useState(null);

    const fetchSkus = async () => {
        try {
            setLoading(true);

            const res = await api.get("/skus");

            setSkus(res.data.data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkus();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete =
            window.confirm(
                "Delete this SKU?"
            );

        if (!confirmDelete) return;

        try {
            await api.delete(`/skus/${id}`);

            fetchSkus();
        } catch (error) {
            console.log(error);
        }
    };

    const filteredSkus =
        skus.filter((sku) =>
            sku.name
                ?.toLowerCase()
                .includes(search.toLowerCase())
        );

    return (
        <DashboardLayout>

            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">

                <div>

                    <h1 className="text-4xl font-bold">
                        SKU Master
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Manage warehouse SKUs
                    </p>

                </div>

                <button
                    onClick={() => {
                        setSelectedSku(null);
                        setOpenModal(true);
                    }}
                    className="
          bg-amber-500
          hover:bg-amber-600
          text-white
          px-5
          py-3
          rounded-xl
          flex
          items-center
          gap-2
          "
                >
                    <FaPlus />
                    Create SKU
                </button>

            </div>

            <div className="mb-6">

                <input
                    type="text"
                    placeholder="Search SKU..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    className="
          w-full
          md:w-96
          border
          rounded-xl
          px-4
          py-3
          "
                />

            </div>

            <div
                className="
        bg-white
        dark:bg-slate-900
        rounded-2xl
        border
        overflow-hidden
        "
            >

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>
                            <tr className="border-b bg-gray-50 dark:bg-slate-800">
                                <th className="p-4 text-left">SKU Code</th>  {/* Changed from "SKU" */}
                                <th className="p-4 text-left">Name</th>       {/* Added this column */}
                                <th className="p-4 text-left">Dimensions</th>
                                <th className="p-4 text-left">Weight</th>
                                <th className="p-4 text-left">Velocity</th>
                                <th className="p-4 text-left">Handling</th>   {/* Added handling column */}
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSkus.map((sku) => (
                                <tr key={sku._id} className="border-b">
                                    <td className="p-4">
                                        <p className="font-mono text-sm">{sku.skuCode}</p>
                                    </td>
                                    <td className="p-4">
                                        <h3 className="font-semibold">{sku.name}</h3>
                                    </td>
                                    <td className="p-4">
                                        {sku.length && sku.width && sku.height
                                            ? `${sku.length} × ${sku.width} × ${sku.height} cm`
                                            : "-"
                                        }
                                    </td>
                                    <td className="p-4">{sku.weight} Kg</td>
                                    <td className="p-4">
                                        <span className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${sku.velocityClass === 'FAST' ? 'bg-green-100 text-green-600' : ''}
          ${sku.velocityClass === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' : ''}
          ${sku.velocityClass === 'SLOW' ? 'bg-red-100 text-red-600' : ''}
        `}>
                                            {sku.velocityClass}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {sku.handlingClasses?.slice(0, 2).map((cls) => (
                                                <span key={cls} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                                    {cls}
                                                </span>
                                            ))}
                                            {sku.handlingClasses?.length > 2 && (
                                                <span className="text-xs text-gray-500">+{sku.handlingClasses.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedSku(sku);
                                                    setOpenModal(true);
                                                }}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sku._id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>


                    </table>

                </div>

            </div>

            <SKUFormModal
                open={openModal}
                onClose={() =>
                    setOpenModal(false)
                }
                selectedSku={selectedSku}
                refresh={fetchSkus}
            />

        </DashboardLayout>
    );
}

export default SKUPage;