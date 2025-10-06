import React from "react";
import { FiHome, FiUsers, FiLogOut } from "react-icons/fi";
import { MdAdminPanelSettings } from "react-icons/md";

const themeColor = "#6E290C";

export default function Sidebar({ activeTab, setActiveTab, handleLogout }) {
  const sidebarItems = [
    { key: "home", label: "Home", icon: <FiHome /> },
    { key: "users", label: "Users", icon: <FiUsers /> },
    { key: "services", label: "Services", icon: <MdAdminPanelSettings /> },
  ];

  return (
    <aside
      className="w-64 text-white p-6 flex flex-col"
      style={{ backgroundColor: themeColor }}
    >
      <h1 className="text-2xl font-bold mb-6">FixItNow Admin</h1>
      <nav className="flex flex-col gap-3 flex-1">
        {sidebarItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`flex items-center gap-3 p-3 rounded-lg transition ${
              activeTab === item.key ? "bg-white/25" : "hover:bg-white/10"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-3 rounded-lg mt-auto hover:bg-white/20 border border-white/30"
      >
        <FiLogOut /> Logout
      </button>
    </aside>
  );
}
