import React from 'react';
import { FiUsers } from 'react-icons/fi';
import { MdAdminPanelSettings } from 'react-icons/md';
import { FaUserTie } from 'react-icons/fa';

const rustBrown = "#6e290cff";

export default function UsersCardHome({ users, loading }) {
  if (loading) return <div className="bg-white border rounded-lg p-4 text-center" style={{ borderColor: rustBrown + "40" }}>Loading users...</div>;
  return (
    <div className="bg-white border rounded-xl p-6" style={{ borderColor: rustBrown + "40" }}>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: rustBrown }}><FiUsers /> Users</h2>
      <div className="divide-y divide-black/10">
        {users.map(u => (
          <div key={u.id} className="flex justify-between items-center py-3 px-2 hover:bg-[rgba(183,65,14,0.1)] rounded-lg transition">
            <div>
              <h3 className="text-lg font-bold">{u.name}</h3>
              <p className="text-sm text-black/70">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {(u.role || "").toLowerCase() === "admin" && <MdAdminPanelSettings className="w-5 h-5" style={{ color: rustBrown }} />}
              {(u.role || "").toLowerCase() === "provider" && <FaUserTie className="w-5 h-5" style={{ color: rustBrown }} />}
              {(u.role || "").toLowerCase() === "customer" && <FiUsers className="w-5 h-5" style={{ color: rustBrown }} />}
              <span className="px-3 py-1 text-sm border rounded-full" style={{ borderColor: rustBrown + "40" }}>{u.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
