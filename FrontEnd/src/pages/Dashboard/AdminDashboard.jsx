import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome, FiUsers, FiLogOut, FiClock, FiCheckCircle, FiBarChart2,
} from "react-icons/fi";
import { BiClipboard, BiUserCircle } from "react-icons/bi";
import { MdAdminPanelSettings } from "react-icons/md";
import { FaUserCheck, FaExclamationTriangle } from "react-icons/fa";
import {
  getAllUsers, getAllServices, getAllBookings,
} from "../../services/api";

import ChatNotifications from "../../components/ChatNotifications";
import DisputeManagement from "../admin/DisputeManagement";
import MetricCard from "./components/Admin/MetricCard";
import BookingsCard from "./components/Admin/BookingsCard";
import UsersCardFull from "./components/Admin/UsersCardFull";
import ServicesCardFull from "./components/Admin/ServicesCardFull";
import AdminChatSection from "./components/admin/AdminChatSection";
import VerifyDocumentsTab from "./components/Admin/VerifyDocumentsTab";
import AdminAnalyticsTab from "./components/Admin/AdminAnalyticsTab";

// 👉 NEW: import the map component
import ServiceLocationMap from "./components/Admin/ServiceLocationMap";

const rustBrown = "#6e290cff";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  // Restore active tab when navigating from notifications
  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab");
    if (savedTab) {
      const tabs = ["home", "users", "services", "chat"];
      if (!isNaN(savedTab)) {
        const index = parseInt(savedTab, 10) - 1;
        if (tabs[index]) setActiveTab(tabs[index]);
      } else {
        setActiveTab(savedTab);
      }
      localStorage.removeItem("activeTab");
    }
  }, []);

  // Fetch Users
  useEffect(() => {
    async function fetchUsers() {
      setLoadingUsers(true);
      try {
        const res = await getAllUsers();
        setUsers(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch users");
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  // Fetch Services
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await getAllServices();
        setServices(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch services");
      }
    }
    fetchServices();
  }, []);

  // Fetch Bookings from backend
  useEffect(() => {
    async function fetchBookings() {
      setLoadingBookings(true);
      try {
        const res = await getAllBookings();
        const sorted = res.data.sort(
          (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
        );
        setBookings(sorted);
        console.log("📦 All Bookings Data:", sorted);

      } catch (err) {
        console.error(err);
        alert("Failed to fetch bookings");
      } finally {
        setLoadingBookings(false);
      }
    }
    fetchBookings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const sidebarItems = [
    { name: "Home", icon: <FiHome className="text-white" />, key: "home" },
    { name: "Analytics", icon: <FiBarChart2 className="text-white" />, key: "analytics" },
    { name: "Users", icon: <BiUserCircle className="text-white" />, key: "users" },
    { name: "Services", icon: <MdAdminPanelSettings className="text-white" />, key: "services" },
    { name: "Chat", icon: <FiUsers className="text-white" />, key: "chat" },
    { name: "Verify Providers", icon: <FiCheckCircle className="text-white" />, key: "verify" },
    { name: "Dispute Management", icon: <FaExclamationTriangle className="text-white" />, key: "disputes" },
  ];

  return (
    <div className="flex min-h-screen bg-white text-black">
      {/* Sidebar */}
      <aside
        className="w-64 p-6 flex flex-col h-screen sticky top-0"
        style={{ backgroundColor: rustBrown }}
      >
        <h2 className="text-2xl font-bold mb-6 text-white">FixItNow Admin</h2>
        <nav className="flex flex-col gap-3 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                activeTab === item.key
                  ? "bg-white/20 font-semibold text-white shadow-md animate-fadeIn"
                  : "hover:bg-white/10 text-white"
              }`}
            >
              <span className="text-lg transition-transform duration-300 hover:rotate-6">
                {item.icon}
              </span>
              <span>{item.name}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-lg mt-auto hover:bg-white/20 text-white border border-white/20"
          >
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      {/* Notification Icon - Top Right Corner Fixed */}
      <div className="fixed top-4 right-6 z-50">
        <ChatNotifications />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === "home" && (
            <div className="space-y-10">
              {/* ⚡ Key Metrics Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Users"
                  value={users.length}
                  icon={<FiUsers style={{ color: rustBrown }} />}
                />
                <MetricCard
                  title="Total Bookings"
                  value={bookings.length}
                  icon={<BiClipboard style={{ color: rustBrown }} />}
                />
                <MetricCard
                  title="Verified Providers"
                  value={
                    users.filter(
                      (u) => (u.role || "").toLowerCase() === "provider"
                    ).length
                  }
                  icon={<FaUserCheck style={{ color: rustBrown }} />}
                />
                <MetricCard
                  title="Pending Approvals"
                  value={0}
                  icon={<MdAdminPanelSettings style={{ color: rustBrown }} />}
                />
              </div>

              {/* 🧾 Main Dashboard Panels */}
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Panel - Recent Bookings */}
                <div className="lg:w-2/3 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col">
                  <div className="flex-1">
                    <BookingsCard
                      bookings={bookings.slice(0, 5)}
                      loading={loadingBookings}
                    />
                  </div>
                </div>

                {/* Right Side - Two Stacked Panels */}
                <div className="lg:w-1/3 flex flex-col gap-6">
                  {/* Booking Stats */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col">
                    <h2 className="text-xl font-semibold mb-4">Booking Stats</h2>
                    {["PENDING", "COMPLETED", "CANCELLED","CONFIRMED"].map((status) => {
                      const count = bookings.filter(
                        (b) => (b.status || "").toUpperCase() === status
                      ).length;
                      const color =
                        status === "PENDING"
                          ? "bg-yellow-400"
                          : status === "COMPLETED"
                          ? "bg-green-500"
                          : status === "CANCELLED"
                          ? "bg-red-500"
                          : "bg-orange-500";
                          
                          
                      const widthPercent = bookings.length
                        ? (count / bookings.length) * 100
                        : 0;

                      return (
                        <div key={status} className="mb-3">
                          <div className="flex justify-between mb-1">
                            <span>{status}</span>
                            <span className="font-semibold">{count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`${color} h-3 rounded-full transition-all duration-1000`}
                              style={{ width: `${widthPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Info */}
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col">
                    <h2 className="text-xl font-semibold mb-4">Quick Info</h2>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-4 p-3 rounded-lg bg-yellow-50">
                        <div className="bg-yellow-200 p-3 rounded-full">
                          <span className="text-2xl">🛠️</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Total Services</p>
                          <p className="font-semibold text-lg">{services.length}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 rounded-lg bg-red-50">
                        <div className="bg-red-200 p-3 rounded-full">
                          <FiClock className="text-red-700 text-2xl" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Pending Bookings</p>
                          <p className="font-semibold text-lg">
                            {
                              bookings.filter(
                                (b) => (b.status || "").toUpperCase() === "PENDING"
                              ).length
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

             {/* 🗺️ Service Location Map + Stats */}
<section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl font-semibold" style={{ color: rustBrown }}>
      Service Locations
    </h2>
    <button
      onClick={() => setActiveTab("analytics")}
      className="px-5 py-2 rounded-lg shadow text-white font-semibold hover:opacity-95 transition"
      style={{ backgroundColor: rustBrown }}
    >
      View Full Analytics
    </button>
  </div>

  <ServiceLocationMap
    bookings={bookings}
    users={users}
    loading={loadingBookings}
  />
</section>

            </div>
          )}

          {activeTab === "analytics" && <AdminAnalyticsTab />}

          {activeTab === "users" && (
            <UsersCardFull users={users} loading={loadingUsers} setUsers={setUsers} />
          )}

          {activeTab === "services" && (
            <ServicesCardFull services={services} setServices={setServices} />
          )}

          {activeTab === "chat" && <AdminChatSection users={users} />}

          {activeTab === "verify" && <VerifyDocumentsTab />}
          {activeTab === "disputes" && <DisputeManagement />}
        </main>
      </div>
    </div>
  );
}
