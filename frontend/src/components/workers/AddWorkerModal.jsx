
import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaLock,
  FaWeightHanging,
  FaTools,
  FaShieldAlt,
  FaUserCheck,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle
} from "react-icons/fa";

function AddWorkerModal({ isOpen, onClose, onSuccess, editingWorker }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    maxSafeWeight: "",
    status: "available",
    skills: [],
    equipmentAuth: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingWorker) {
      setForm({
        name: editingWorker.name || "",
        email: editingWorker.email || "",
        password: "",
        maxSafeWeight: editingWorker.maxSafeWeight || "",
        status: editingWorker.status || "available",
        skills: editingWorker.skills || [],
        equipmentAuth: editingWorker.equipmentAuth || [],
      });
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        maxSafeWeight: "",
        status: "available",
        skills: [],
        equipmentAuth: [],
      });
    }
    setError("");
  }, [editingWorker, isOpen]);

  if (!isOpen) return null;

  const skills = [
    { value: "receive", label: "Receive", icon: "📥" },
    { value: "putaway", label: "Putaway", icon: "📦" },
    { value: "pick", label: "Pick", icon: "🎯" },
    { value: "pack", label: "Pack", icon: "📋" },
    { value: "ship", label: "Ship", icon: "🚚" },
    { value: "returns", label: "Returns", icon: "🔄" },
  ];

  const equipment = [
    { value: "forklift", label: "Forklift", icon: "🏗️" },
    { value: "reach_truck", label: "Reach Truck", icon: "🚛" },
    { value: "pallet_jack", label: "Pallet Jack", icon: "🛒" },
  ];

  const handleCheckbox = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.name) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (!form.email) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    if (!editingWorker && !form.password) {
      setError("Password is required for new worker");
      setLoading(false);
      return;
    }

    if (form.password && form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (!form.maxSafeWeight) {
      setError("Max Safe Weight is required");
      setLoading(false);
      return;
    }

    if (form.maxSafeWeight <= 0) {
      setError("Max Safe Weight must be greater than 0");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    const isEditing = !!editingWorker;

    const workerData = {
      name: form.name,
      email: form.email,
      skills: form.skills,
      equipmentAuth: form.equipmentAuth,
      maxSafeWeight: Number(form.maxSafeWeight),
      status: form.status,
    };

    if (form.password) {
      workerData.password = form.password;
    }

    try {
      let response;

      if (isEditing) {
        response = await axios.put(
          `https://warehouse-management-system-backend-qro9.onrender.com/api/workers/${editingWorker._id}`,
          workerData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          "https://warehouse-management-system-backend-qro9.onrender.com/api/workers",
          workerData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      onSuccess?.(response.data.data);
      onClose();
    } catch (err) {
      console.error("Error:", err);

      if (err.response?.data?.code === 11000 ||
        err.response?.data?.message?.includes("duplicate") ||
        err.response?.data?.message?.includes("email")) {
        setError("Email already exists. Please use a different email.");
      } else {
        setError(
          err.response?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} worker`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate selected counts
  const selectedSkillsCount = form.skills.length;
  const selectedEquipmentCount = form.equipmentAuth.length;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slideUp">
        <form onSubmit={handleSubmit}>
          {/* Header - Responsive */}
          <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex justify-between items-center p-4 sm:p-6 border-b dark:border-slate-700">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
                {editingWorker ? "Edit Worker" : "Create Worker"}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                {editingWorker ? "Update worker information" : "Add new warehouse worker"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-2xl hover:text-gray-500 dark:hover:text-gray-400 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              <FaTimes className="text-lg sm:text-xl" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm sm:text-base animate-shake">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="text-lg mt-0.5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Name Field */}
            <div className="group">
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                  placeholder="e.g., Ramesh Kumar"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="group">
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                  placeholder="worker@example.com"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email must be unique in the system
              </p>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                Password {!editingWorker && <span className="text-red-500">*</span>}
                {editingWorker && <span className="text-xs text-gray-500"> (Leave blank to keep current)</span>}
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  required={!editingWorker}
                  minLength="6"
                  className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-12 sm:pr-12 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                  placeholder={editingWorker ? "New password (optional)" : "Minimum 6 characters"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Skills Section */}
            <div className="space-y-3">
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                <FaTools className="inline mr-2 text-amber-500" />
                Skills
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 sm:p-4 border dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800">
                {skills.map((skill) => (
                  <label key={skill.value} className="flex items-center gap-2 cursor-pointer hover:bg-white dark:hover:bg-slate-700 p-1 rounded transition">
                    <input
                      type="checkbox"
                      checked={form.skills.includes(skill.value)}
                      onChange={() => handleCheckbox("skills", skill.value)}
                      className="cursor-pointer w-4 h-4 accent-amber-500"
                    />
                    <span className="text-sm">
                      {skill.icon} {skill.label}
                    </span>
                  </label>
                ))}
              </div>
              {selectedSkillsCount > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.skills.map((skill) => {
                    const skillInfo = skills.find(s => s.value === skill);
                    return (
                      <span key={skill} className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs">
                        {skillInfo?.icon} {skillInfo?.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Equipment Authorization Section */}
            <div className="space-y-3">
              <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                <FaShieldAlt className="inline mr-2 text-amber-500" />
                Equipment Authorization
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 sm:p-4 border dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800">
                {equipment.map((item) => (
                  <label key={item.value} className="flex items-center gap-2 cursor-pointer hover:bg-white dark:hover:bg-slate-700 p-1 rounded transition">
                    <input
                      type="checkbox"
                      checked={form.equipmentAuth.includes(item.value)}
                      onChange={() => handleCheckbox("equipmentAuth", item.value)}
                      className="cursor-pointer w-4 h-4 accent-amber-500"
                    />
                    <span className="text-sm">
                      {item.icon} {item.label}
                    </span>
                  </label>
                ))}
              </div>
              {selectedEquipmentCount > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.equipmentAuth.map((item) => {
                    const equipInfo = equipment.find(e => e.value === item);
                    return (
                      <span key={item} className="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full text-xs">
                        {equipInfo?.icon} {equipInfo?.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Max Safe Weight Field */}
            <div className="group">
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                Max Safe Weight (Kg) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaWeightHanging className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                <input
                  type="number"
                  name="maxSafeWeight"
                  value={form.maxSafeWeight}
                  onChange={handleInputChange}
                  required
                  min="1"
                  step="1"
                  className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                  placeholder="e.g., 75"
                />
              </div>
            </div>

            {/* Status Field */}
            <div className="group">
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
                <FaUserCheck className="inline mr-2 text-amber-500" />
                Status
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="w-full border dark:border-slate-700 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base focus:ring-2 focus:ring-amber-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition"
                >
                  <option value="available">Available</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            {/* Form Summary - Mobile Only */}
            <div className="block sm:hidden mt-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Summary</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium">{form.name || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium truncate max-w-[200px]">{form.email || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Weight:</span>
                  <span className="font-medium">{form.maxSafeWeight ? `${form.maxSafeWeight} kg` : "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Skills:</span>
                  <span className="font-medium">{selectedSkillsCount} selected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Responsive */}
          <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t dark:border-slate-700 p-4 sm:p-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="border dark:border-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50 text-sm sm:text-base order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2 text-sm sm:text-base"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? "Saving..." : (editingWorker ? "Update Worker" : "Create Worker")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default AddWorkerModal;