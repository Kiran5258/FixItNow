// src/pages/Dashboard/CustomerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiLogOut,
  FiSearch,
  FiClipboard,
  FiStar,
  FiUser,
  FiMapPin,
  FiTool,
} from "react-icons/fi";
import { MdMiscellaneousServices } from "react-icons/md";
import { BiHistory } from "react-icons/bi";
import { getAllServices, getMyProfile } from "../../services/api";

const rustBrown = "#6e290cff";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");
const [locationSearch, setLocationSearch] = useState("");

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: "",
    email: "",
    location: "",
  });

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        setCustomer(res.data);
        setEditProfileData({
          name: res.data.name || "",
          email: res.data.email || "",
          location: res.data.location || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  // Fetch services
  useEffect(() => {
    setLoading(true);
    getAllServices()
      .then((res) => setServices(res.data))
      .catch((err) => console.error("Error fetching services:", err))
      .finally(() => setLoading(false));
  }, []);

  // Dummy bookings
  useEffect(() => {
    setBookings([
      { id: 101, service: "Fan Repair", provider: "Ravi", status: "Confirmed" },
      {
        id: 102,
        service: "Pipe Fitting",
        provider: "Kumar",
        status: "Completed",
      },
    ]);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSaveProfile = () => {
    setCustomer(editProfileData);
    setIsEditingProfile(false);
    // TODO: Add API call to update profile
  };

  const handleCancelProfile = () => {
    setEditProfileData({ ...customer });
    setIsEditingProfile(false);
  };

  const sidebarItems = [
    { name: "Home", icon: <FiHome />, key: "home" },
    {
      name: "Browse Services",
      icon: <MdMiscellaneousServices />,
      key: "services",
    },
    { name: "My Bookings", icon: <BiHistory />, key: "bookings" },
    { name: "Profile", icon: <FiUser />, key: "profile" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      {/* Sidebar */}
      <aside
        className="w-64 p-6 flex flex-col h-screen sticky top-0"
        style={{ backgroundColor: rustBrown }}
      >
        <h2 className="text-2xl font-bold mb-6 text-white">FixItNow</h2>
        <nav className="flex flex-col gap-3 flex-1">
          {sidebarItems.map((item) => (
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
      <main className="flex-1 p-6 overflow-y-auto">
        {/* HOME TAB */}
        {activeTab === "home" && customer && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-4">
              Welcome, {customer.name} 👋
            </h1>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Total Bookings"
                value={bookings.length}
                icon={<FiClipboard style={{ color: rustBrown }} />}
              />
              <MetricCard
                title="Available Services"
                value={services.length}
                icon={<MdMiscellaneousServices style={{ color: rustBrown }} />}
              />
              <MetricCard
                title="Avg. Rating"
                value={"4.6"}
                icon={<FiStar style={{ color: rustBrown }} />}
              />
            </div>

            {/* Top Providers */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: rustBrown }}
              >
                Top Providers Near You
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between items-center p-4 rounded-lg shadow hover:shadow-lg transition bg-gradient-to-r from-orange-50 to-white"
                  >
                    <div>
                      <p className="font-bold">{s.providerName}</p>
                      <p className="text-sm text-gray-600">{s.category}</p>
                    </div>
                    <span className="text-yellow-500 font-semibold">
                      ★ {s.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: rustBrown }}
              >
                Upcoming Bookings
              </h2>
              {bookings
                .filter((b) => b.status === "Confirmed")
                .slice(0, 3)
                .map((b) => (
                  <div
                    key={b.id}
                    className="flex justify-between py-2 border-b last:border-b-0"
                  >
                    <p className="font-medium">{b.service}</p>
                    <span className="text-sm text-gray-600">{b.provider}</span>
                  </div>
                ))}
              {bookings.filter((b) => b.status === "Confirmed").length ===
                0 && <p className="text-gray-500">No upcoming bookings</p>}
            </div>

            {/* Recommended Services */}
            <div>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: rustBrown }}
              >
                Recommended For You
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {services.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl shadow-md bg-gradient-to-br from-indigo-50 to-white hover:shadow-lg transition"
                  >
                    <p className="font-bold text-lg">{s.category}</p>
                    <p className="text-sm text-gray-600">{s.subcategory}</p>
                    <button className="mt-2 text-blue-600 hover:underline font-semibold">
                      Book Now →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Tip */}
            <div className="bg-gradient-to-r from-blue-100 to-indigo-50 p-6 rounded-xl flex justify-between items-center shadow-md hover:shadow-lg transition">
              <div>
                <h3 className="font-bold text-lg">Today's Tip 🌤️</h3>
                <p className="text-gray-700">
                  It’s sunny today! Perfect time to get your solar panel
                  cleaned.
                </p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Find Nearby Services
              </button>
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
{activeTab === "services" && (
  <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">

    {/* Header */}
    <div className="text-center mb-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Find Trusted Professionals Near You
      </h1>
      <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
        Discover verified service providers — electricians, plumbers, carpenters, and more — ready to assist you anytime.
      </p>
    </div>

    {/* Search & Filter Bar */}
    <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-4xl mx-auto">
      {/* Category Search */}
      <div className="relative flex-1">
        <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
        <input
          type="text"
          placeholder="Search by category (e.g., electrician, plumber...)"
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-white shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>

      {/* Location Search */}
      <div className="relative flex-1">
        <FiMapPin className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
        <input
          type="text"
          placeholder="Search by location..."
          value={locationSearch}
          onChange={(e) => setLocationSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-white shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>
    </div>

    {/* Services Grid */}
    {loading ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[1, 2, 3, 4, 5, 6].map((_, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-md animate-pulse h-80"></div>
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {services
          .filter(
            (service) =>
              service.category
                .toLowerCase()
                .includes(categorySearch.toLowerCase()) &&
              service.location
                .toLowerCase()
                .includes(locationSearch.toLowerCase())
          )
          .map((service) => {
            const isNotAvailable =
              service.availability &&
              service.availability.toLowerCase() === "not available";
            const availabilityText = isNotAvailable
              ? "Not Available"
              : service.availability || "Available";

            return (
              <div
                key={service.id}
                className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 hover:scale-[1.02] border border-gray-100 flex flex-col justify-between h-full min-h-[340px]"
              >
                {/* Top Section: Category + Availability */}
                <div className="flex justify-between items-center mb-4">
                  
                  {/* Category */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full shadow-sm">
                    <FiTool className="text-blue-700 text-sm" />
                    <span className="text-sm font-semibold text-blue-800">
                      {service.category}
                    </span>
                  </div>

                 


                </div>

                {/* Service Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                  {service.subcategory}
                </h3>
                <p className="text-sm text-gray-600 space-y-1 mb-4">Description : {service.description}</p>

                {/* Provider Info */}
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p className="flex items-center gap-1 truncate">
                    <FiUser className="text-gray-400" />
                    {service.providerName || service.name}
                  </p>
                  <br></br>
                  {service.location && (
                    <p className="flex items-center gap-1 ">
                      <FiMapPin className="text-gray-400" /> 📍{service.location}
                    </p>
                  )}
                </div>
{/* Availability Badge */}
<div className="flex items-center gap-2">
  {/* Status Dot */}
  <span
    className={`w-3 h-3 rounded-full bg-green-500 animate-pulse${
      availabilityText 
       
    }
    }`}
  ></span>

 


  <span className="text-xs font-medium">{availabilityText}</span>
</div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-3"></div>

<br></br>

                {/* Bottom Section: Price + Button */}
                <div className="flex justify-between items-center mt-auto">
                  <span className="font-bold text-blue-600 text-lg">
                    ₹{service.price}
                  </span>
                  <button
                    className={`px-6 py-2.5 rounded-full font-semibold text-white shadow-md transition-all ${
                      isNotAvailable
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-blue-700"
                    }`}
                    disabled={isNotAvailable}
                  >
                    {isNotAvailable ? "Unavailable" : "Book Now"}
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    )}
  </div>
)}


        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div className="bg-white p-6 rounded-xl border shadow">
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: rustBrown }}
            >
              My Bookings
            </h2>
            <div className="divide-y divide-gray-200">
              {bookings.map((b) => (
                <div key={b.id} className="flex justify-between py-3">
                  <div>
                    <p className="font-medium">{b.service}</p>
                    <p className="text-sm text-gray-600">
                      Provider: {b.provider}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-sm rounded-full bg-gray-100">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && customer && (
          <div className="bg-white p-6 rounded-xl border shadow w-full max-w-md relative">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: rustBrown }}
            >
              My Profile
            </h2>
            <div className="flex flex-col gap-2">
              <p>
                <strong>Name:</strong> {customer.name}
              </p>
              <p>
                <strong>Email:</strong> {customer.email}
              </p>
              <p>
                <strong>Location:</strong> {customer.location}
              </p>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-2 py-2 rounded-md text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-transform transform hover:scale-105"
              >
                Edit Profile
              </button>
            </div>

            {/* Modal */}
            {isEditingProfile && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
                  <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                  <input
                    type="text"
                    value={editProfileData.name}
                    onChange={(e) =>
                      setEditProfileData({
                        ...editProfileData,
                        name: e.target.value,
                      })
                    }
                    className="border px-3 py-2 rounded w-full mb-3"
                    placeholder="Name"
                  />
                  <input
                    type="email"
                    value={editProfileData.email}
                    onChange={(e) =>
                      setEditProfileData({
                        ...editProfileData,
                        email: e.target.value,
                      })
                    }
                    className="border px-3 py-2 rounded w-full mb-3"
                    placeholder="Email"
                  />
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={editProfileData.location}
                      onChange={(e) =>
                        setEditProfileData({
                          ...editProfileData,
                          location: e.target.value,
                        })
                      }
                      className="border px-3 py-2 rounded flex-1"
                      placeholder="Location"
                    />
                    <button
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            async (pos) => {
                              const { latitude, longitude } = pos.coords;
                              try {
                                const response = await fetch(
                                  `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                                );
                                const data = await response.json();
                                setEditProfileData((prev) => ({
                                  ...prev,
                                  location:
                                    data.display_name ||
                                    `Lat: ${latitude}, Lon: ${longitude}`,
                                }));
                              } catch (error) {
                                console.error("Error getting address:", error);
                                alert("Failed to retrieve location details.");
                              }
                            },
                            (error) => {
                              console.error("Geolocation error:", error);
                              alert("Please allow location access.");
                            }
                          );
                        } else {
                          alert("Geolocation not supported.");
                        }
                      }}
                      className="px-2 py-2 rounded-md text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-transform transform hover:scale-105"
                    >
                      Use My Location
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2 justify-end">
                    <button
                      onClick={handleSaveProfile}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelProfile}
                      className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
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
    <div className="bg-white border p-5 rounded-xl shadow-md flex flex-col items-center justify-center gap-2 hover:shadow-lg transition">
      <div className="text-3xl">{icon}</div>
      <h2 className="text-xl font-bold">{value}</h2>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}
