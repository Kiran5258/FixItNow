import React, { useState } from 'react';
import { FiUsers } from 'react-icons/fi';
import { MdAdminPanelSettings } from 'react-icons/md';
import { FaUserTie } from 'react-icons/fa';
import { updateUser, deleteUser } from '../../../../services/api';

const rustBrown = "#6e290cff";

export default function UsersCardFull({ users, loading, setUsers }) {
  if (loading)
    return (
      <div
        className="bg-white border rounded-lg p-6 text-center shadow-md"
        style={{ borderColor: rustBrown + "40" }}
      >
        Loading users...
      </div>
    );

  return (
    <div
      className="bg-white border rounded-xl p-6 w-full shadow-md"
      style={{ borderColor: rustBrown + "40" }}
    >
      <h2
        className="text-2xl font-semibold mb-6 flex items-center gap-3"
        style={{ color: rustBrown }}
      >
        <FiUsers /> Manage Users
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <UserCard key={u.id} user={u} setUsers={setUsers} users={users} />
        ))}
      </div>
    </div>
  );
}

function UserCard({ user, users, setUsers }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...user });

  const roleIcon =
    (user.role || "").toLowerCase() === "admin" ? (
      <MdAdminPanelSettings className="w-6 h-6 text-white" />
    ) : (user.role || "").toLowerCase() === "provider" ? (
      <FaUserTie className="w-6 h-6 text-white" />
    ) : (
      <FiUsers className="w-6 h-6 text-white" />
    );

  const handleSave = async () => {
    try {
      await updateUser(user.id, editData);
      setUsers(users.map((u) => (u.id === user.id ? editData : u)));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update user.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(user.id);
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  return (
    <>
      <div
  className="flex flex-col justify-between bg-gradient-to-r from-white to-[#fff7f2] border rounded-xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 hover:scale-[1.02] p-5 animate-fadeIn"
  style={{ borderColor: rustBrown + "40" }}
>

        <div className="flex items-center gap-4 mb-3">
          <div className="px-2 py-2 rounded bg-gradient-to-r from-black to-[#B7410E] shadow-lg">{roleIcon}</div>
          <h3 className="text-lg font-bold">{user.name}</h3>
        </div>
        <p className="text-sm text-black/70 mb-3">{user.email}</p>
        <div className="flex justify-end gap-2">
          
          <button className="bg-[#B7410E] text-white px-3 py-1 rounded hover:bg-[#8a300b] transition" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {/* Modal */}
      
{isEditing && (
  <div 
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={() => setIsEditing(false)} // Close on outside click
  >
    <div 
      className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative"
      onClick={(e) => e.stopPropagation()} // Prevent modal click from closing
    >
      {/* Close Button */}
      <button
        onClick={() => setIsEditing(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold"
      >
        &times;
      </button>

      <h2 className="text-xl font-semibold mb-4">Edit User</h2>
      <input
        type="text"
        value={editData.name}
        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
        className="border px-3 py-2 rounded w-full mb-3"
        placeholder="Name"
      />
      <input
        type="email"
        value={editData.email}
        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
        className="border px-3 py-2 rounded w-full mb-3"
        placeholder="Email"
      />
      <select
        value={editData.role}
        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
        className="border px-3 py-2 rounded w-full mb-4"
      >
        <option value="ADMIN">ADMIN</option>
        <option value="PROVIDER">PROVIDER</option>
        <option value="CUSTOMER">CUSTOMER</option>
      </select>
      <div className="flex justify-end gap-2">
        <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
        <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
      </div>
    </div>
  </div>
)}

    </>
  );
}
