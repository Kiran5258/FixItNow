// src/pages/Dashboard/CustomerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome, FiLogOut, FiSearch, FiClipboard, FiStar, FiUser
} from "react-icons/fi";
import { MdMiscellaneousServices } from "react-icons/md";
import { BiHistory } from "react-icons/bi";

const rustBrown = "#6e290cff";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sample customer data
  const [customer, setCustomer] = useState({
    name: "Harini",
    email: "harini@example.com",
    location: "Chennai",
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ ...customer });

  // Fetch services (mock)
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setServices([
        {
          id: 1,
          category: "Electrician",
          subcategory: "Fan Repair",
          description: "Expert in repairing ceiling and table fans.",
          price: 300,
          rating: 4.5,
        },
        {
          id: 2,
          category: "Plumber",
          subcategory: "Pipe Fitting",
          description: "Quick plumbing fixes and leak repair.",
          price: 500,
          rating: 4.7,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  // Fetch bookings (mock)
  useEffect(() => {
    setBookings([
      { id: 101, service: "Fan Repair", provider: "Ravi", status: "Confirmed" },
      { id: 102, service: "Pipe Fitting", provider: "Kumar", status: "Completed" },
    ]);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSaveProfile = () => {
    setCustomer(editProfileData); // save changes
    setIsEditingProfile(false);
    // Here you can also call your API to update the profile on backend
  };

  const handleCancelProfile = () => {
    setEditProfileData({ ...customer });
    setIsEditingProfile(false);
  };

  const sidebarItems = [
    { name: "Home", icon: <FiHome />, key: "home" },
    { name: "Browse Services", icon: <MdMiscellaneousServices />, key: "services" },
    { name: "My Bookings", icon: <BiHistory />, key: "bookings" },
    { name: "Profile", icon: <FiUser />, key: "profile" },
  ];

  return (
    <div className="flex min-h-screen bg-white text-black">
      {/* Sidebar */}
      <aside className="w-64 p-6 flex flex-col" style={{ backgroundColor: rustBrown }}>
        <h2 className="text-2xl font-bold mb-6 text-white">FixItNow</h2>
        <nav className="flex flex-col gap-3 flex-1">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                activeTab === item.key
                  ? "bg-white/20 font-semibold text-white"
                  : "hover:bg-white/10 text-white"
              }`}
            >
              {item.icon} <span>{item.name}</span>
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

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50">
        {/* HOME TAB */}
        {activeTab === "home" && (
          <>
            <h1 className="text-2xl font-bold mb-4">Welcome, {customer.name} 👋</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <MetricCard title="Total Bookings" value={bookings.length} icon={<FiClipboard style={{ color: rustBrown }} />} />
              <MetricCard title="Available Services" value={services.length} icon={<MdMiscellaneousServices style={{ color: rustBrown }} />} />
              <MetricCard title="Avg. Rating" value={"4.6"} icon={<FiStar style={{ color: rustBrown }} />} />
            </div>
          </>
        )}

        {/* SERVICES TAB */}
        {activeTab === "services" && (
          <div>
            <div className="flex items-center gap-3 bg-white p-3 rounded shadow mb-6">
              <FiSearch className="text-gray-500" />
              <input
                type="text"
                placeholder="Search for services (Electrician, Plumber, etc.)"
                className="flex-1 outline-none"
              />
            </div>
            {loading ? (
              <p>Loading services...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(service => (
                  <div key={service.id} className="bg-white p-5 border rounded-xl shadow hover:shadow-md transition">
                    <h3 className="font-bold">{service.category} - {service.subcategory}</h3>
                    <p className="text-sm text-gray-600 mt-2">{service.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-semibold text-blue-600">₹{service.price}</span>
                      <span className="text-yellow-500 text-sm">★ {service.rating}</span>
                    </div>
                    <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div className="bg-white p-6 rounded-xl border shadow">
            <h2 className="text-xl font-semibold mb-3" style={{ color: rustBrown }}>My Bookings</h2>
            <div className="divide-y divide-gray-200">
              {bookings.map(b => (
                <div key={b.id} className="flex justify-between py-3">
                  <div>
                    <p className="font-medium">{b.service}</p>
                    <p className="text-sm text-gray-600">Provider: {b.provider}</p>
                  </div>
                  <span className="px-3 py-1 text-sm rounded-full bg-gray-100">{b.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="bg-white p-6 rounded-xl border shadow w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4" style={{ color: rustBrown }}>My Profile</h2>
            {isEditingProfile ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={editProfileData.name}
                  onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
                  className="border px-3 py-2 rounded"
                  placeholder="Name"
                />
                <input
                  type="email"
                  value={editProfileData.email}
                  onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
                  className="border px-3 py-2 rounded"
                  placeholder="Email"
                />
                <input
                  type="text"
                  value={editProfileData.location}
                  onChange={(e) => setEditProfileData({ ...editProfileData, location: e.target.value })}
                  className="border px-3 py-2 rounded"
                  placeholder="Location"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleSaveProfile} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
                  <button onClick={handleCancelProfile} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p><strong>Name:</strong> {customer.name}</p>
                <p><strong>Email:</strong> {customer.email}</p>
                <p><strong>Location:</strong> {customer.location}</p>
                <button onClick={() => setIsEditingProfile(true)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit Profile</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Metric Card
function MetricCard({ title, value, icon }) {
  return (
    <div className="bg-white border p-5 rounded-xl shadow-md flex flex-col items-center justify-center gap-2">
      <div className="text-3xl">{icon}</div>
      <h2 className="text-xl font-bold">{value}</h2>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}
