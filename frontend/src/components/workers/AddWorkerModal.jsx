
import { useState, useEffect } from "react";
import axios from "axios";

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

  // Populate form when editing
  useEffect(() => {
    if (editingWorker) {
      setForm({
        name: editingWorker.name || "",
        email: editingWorker.email || "",
        password: "", // Don't populate password for security
        maxSafeWeight: editingWorker.maxSafeWeight || "",
        status: editingWorker.status || "available",
        skills: editingWorker.skills || [],
        equipmentAuth: editingWorker.equipmentAuth || [],
      });
    } else {
      // Reset form when adding new
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
  }, [editingWorker, isOpen]);

  if (!isOpen) return null;

  const skills = ["receive", "putaway", "pick", "pack", "ship", "returns"];
  const equipment = ["forklift", "reach_truck", "pallet_jack"];

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

    // Validation
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

    const token = localStorage.getItem("token");
    const isEditing = !!editingWorker;

    // Prepare data
    const workerData = {
      name: form.name,
      email: form.email,
      skills: form.skills,
      equipmentAuth: form.equipmentAuth,
      maxSafeWeight: Number(form.maxSafeWeight),
      status: form.status,
    };

    // Only include password if provided (for new worker or password change)
    if (form.password) {
      workerData.password = form.password;
    }

    try {
      let response;

      if (isEditing) {
        // Update existing worker
        response = await axios.put(
          `http://localhost:5000/api/workers/${editingWorker._id}`,
          workerData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Create new worker
        response = await axios.post(
          "http://localhost:5000/api/workers",
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

      // Handle duplicate email error
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh]">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold mb-6">
            {editingWorker ? "Edit Worker" : "Create Worker"}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              required
              className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., Ramesh Kumar"
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              required
              className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
              placeholder="worker@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email must be unique
            </p>
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label className="block mb-2 font-medium">
              Password {!editingWorker && <span className="text-red-500">*</span>}
              {editingWorker && <span className="text-xs text-gray-500"> (Leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleInputChange}
              required={!editingWorker}
              minLength="6"
              className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
              placeholder={editingWorker ? "New password (optional)" : "Minimum 6 characters"}
            />
          </div>

          {/* Skills Section */}
          <h3 className="font-semibold mb-3">Skills</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {skills.map((skill) => (
              <label key={skill} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.skills.includes(skill)}
                  onChange={() => handleCheckbox("skills", skill)}
                  className="cursor-pointer"
                />
                <span className="capitalize cursor-pointer">{skill}</span>
              </label>
            ))}
          </div>

          {/* Equipment Authorization Section */}
          <h3 className="font-semibold mb-3">Equipment Authorization</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {equipment.map((item) => (
              <label key={item} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.equipmentAuth.includes(item)}
                  onChange={() => handleCheckbox("equipmentAuth", item)}
                  className="cursor-pointer"
                />
                <span className="capitalize cursor-pointer">
                  {item.replace("_", " ")}
                </span>
              </label>
            ))}
          </div>

          {/* Max Safe Weight Field */}
          <div className="mb-6">
            <label className="block mb-2 font-medium">
              Max Safe Weight (Kg) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="maxSafeWeight"
              value={form.maxSafeWeight}
              onChange={handleInputChange}
              required
              min="0"
              step="1"
              className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., 75"
            />
          </div>

          {/* Status Field */}
          <div className="mb-6">
            <label className="block mb-2 font-medium">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleInputChange}
              className="w-full border rounded-xl p-3 mt-1 focus:ring-2 focus:ring-amber-500"
            >
              <option value="available">Available</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Form Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-3 border rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : (editingWorker ? "Update Worker" : "Create Worker")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddWorkerModal;