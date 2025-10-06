import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, getAllServices } from "../../services/api";
import Sidebar from "./Sidebar";
import Metric from "./Metric";
import UsersPanel from "../../panel/UsersPanel";
import ServicesPanel from "../../panel/ServicePanel";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("home");
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  // const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    loadServices();
    // loadBookings();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const res = await getAllServices();
      setServices(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch services");
    }
  };

  // const loadBookings = async () => {
  //   try {
  //     const res = await getAllBookings();
  //     setBookings(res.data);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

      <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        {activeTab === "home" && (
          <>
            <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Metric title="Total Users" value={users.length} />
              <Metric title="Total Services" value={services.length} />
              {/* <Metric title="Total Bookings" value={bookings.length} /> */}
            </div>
          </>
        )}

        {activeTab === "users" && <UsersPanel users={users} setUsers={setUsers} />}
        {activeTab === "services" && <ServicesPanel services={services} setServices={setServices} />}
      </main>
    </div>
  );
}
