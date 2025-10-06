import React, { useState } from "react";
import { FiUsers } from "react-icons/fi";
import { deleteUser } from "../services/api";
import Modal from "../components/Model";

export default function UsersPanel({ users = [], setUsers }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser?.id) {
      console.error("Missing user ID");
      return;
    }

    try {
      setLoading(true);
      await deleteUser(selectedUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setConfirmOpen(false);
      setSuccessOpen(true);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#6E290C]">
        <FiUsers /> Manage Users
      </h2>

      {users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="divide-y">
          {users.map((u, index) => (
            <div
              key={u.id || u.email || index} 
              className="flex justify-between py-3 hover:bg-gray-50 px-2 rounded"
            >
              <div>
                <h3 className="font-semibold">{u.name || "Unnamed User"}</h3>
                <p className="text-sm text-gray-500">{u.email || "No email"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm border px-3 py-1 rounded-full capitalize">
                  {u.role || "unknown"}
                </span>
                <button
                  onClick={() => handleDeleteClick(u)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🧾 Confirm Delete Modal */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Deletion"
      >
        <p className="text-gray-700">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{selectedUser?.name}</span>?
        </p>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={() => setConfirmOpen(false)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Success"
      >
        <p className="text-green-700">
          User <span className="font-semibold">{selectedUser?.name}</span> has
          been deleted successfully.
        </p>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setSuccessOpen(false)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            OK
          </button>
        </div>
      </Modal>
    </div>
  );
}
