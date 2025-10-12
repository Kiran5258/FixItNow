// src/pages/Dashboard/CustomerDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiLogOut,
  FiSearch,
  FiClipboard,
  FiStar,
  FiUser,
  FiMapPin,
} from "react-icons/fi";
import { MdMiscellaneousServices } from "react-icons/md";
import { BiHistory } from "react-icons/bi";
import { getAllServices, getMyProfile } from "../../services/api";
import MapView from "../../components/MapView";

// --- 🔁 Simple geocode cache to prevent re-fetching same locations
const geoCache = {};

const geocodeLocation = async (location) => {
  if (!location) return null;
  if (geoCache[location]) return geoCache[location]; // use cached
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        location
      )}`
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const coords = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
      geoCache[location] = coords;
      return coords;
    }
  } catch (err) {
    console.error("Geocoding error:", err);
  }
  return null;
};

const rustBrown = "#6e290cff";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [hoveredServiceId, setHoveredServiceId] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: "",
    email: "",
    location: "",
  });

  // --- 🚀 Fetch all data quickly and lazy-load geocodes
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [profileRes, servicesRes] = await Promise.all([
          getMyProfile(),
          getAllServices(),
        ]);

        // Profile setup
        const user = profileRes.data;
        setCustomer(user);
        setEditProfileData({
          name: user.name || "",
          email: user.email || "",
          location: user.location || "",
        });

        // Step 1: show services instantly
        setServices(servicesRes.data);

        // Step 2: geocode lazily in background
        Promise.all(
          servicesRes.data.map(async (s) => {
            const coords = await geocodeLocation(s.location);
            return { ...s, ...coords };
          })
        ).then((updated) => {
          setServices(updated);
        });

        // Dummy bookings
        setBookings([
          { id: 101, service: "Fan Repair", provider: "Ravi", status: "Confirmed" },
          { id: 102, service: "Pipe Fitting", provider: "Kumar", status: "Completed" },
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchAllData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSaveProfile = () => {
    setCustomer(editProfileData);
    setIsEditingProfile(false);
    // TODO: API call to save profile
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

  const filteredServices = services.filter(
    (s) =>
      s.category?.toLowerCase().includes(categorySearch.toLowerCase()) &&
      s.location?.toLowerCase().includes(locationSearch.toLowerCase())
  );

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
      {!customer ? (
        <div className="flex flex-1 items-center justify-center text-gray-600 text-lg">
          Loading dashboard...
        </div>
      ) : (
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
                <h2 className="text-xl font-semibold mb-4" style={{ color: rustBrown }}>
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
                <h2 className="text-xl font-semibold mb-4" style={{ color: rustBrown }}>
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
                {bookings.filter((b) => b.status === "Confirmed").length === 0 && (
                  <p className="text-gray-500">No upcoming bookings</p>
                )}
              </div>
            </div>
          )}

          {/* SERVICES TAB */}
          {activeTab === "services" && (
            <ServicesTab
              services={filteredServices}
              hoveredServiceId={hoveredServiceId}
              setHoveredServiceId={setHoveredServiceId}
              categorySearch={categorySearch}
              setCategorySearch={setCategorySearch}
              locationSearch={locationSearch}
              setLocationSearch={setLocationSearch}
            />
          )}

          {/* BOOKINGS TAB */}
          {activeTab === "bookings" && <BookingsTab bookings={bookings} />}

          {/* PROFILE TAB */}
          {activeTab === "profile" && customer && (
            <ProfileTab
              customer={customer}
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
              editProfileData={editProfileData}
              setEditProfileData={setEditProfileData}
              handleSaveProfile={handleSaveProfile}
              handleCancelProfile={handleCancelProfile}
            />
          )}
        </main>
      )}
    </div>
  );
}

/* ----------------- COMPONENTS ----------------- */

function MetricCard({ title, value, icon }) {
  return (
    <div className="bg-white border p-5 rounded-xl shadow-md flex flex-col items-center justify-center gap-2 hover:shadow-lg transition">
      <div className="text-3xl">{icon}</div>
      <h2 className="text-xl font-bold">{value}</h2>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

function ServicesTab({
  services,
  hoveredServiceId,
  setHoveredServiceId,
  categorySearch,
  setCategorySearch,
  locationSearch,
  setLocationSearch,
}) {
  const [mapCenter, setMapCenter] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapCenter && mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [mapCenter]);

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Find Trusted Professionals Near You
        </h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
          Discover verified service providers — electricians, plumbers, carpenters, and more.
        </p>
      </div>

      {/* Search Fields */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-4xl mx-auto">
        <SearchInput
          icon={<FiSearch />}
          placeholder="Search by category..."
          value={categorySearch}
          onChange={setCategorySearch}
        />
        <SearchInput
          icon={<FiMapPin />}
          placeholder="Search by location..."
          value={locationSearch}
          onChange={setLocationSearch}
        />
      </div>

      {/* Map */}
      <div className="mb-10 max-w-6xl mx-auto" ref={mapRef}>
        <MapView
          services={services}
          hoveredServiceId={hoveredServiceId}
          center={mapCenter}
        />
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            setMapCenter={setMapCenter}
            setHoveredServiceId={setHoveredServiceId}
          />
        ))}
      </div>
    </div>
  );
}

function ServiceCard({ service, setMapCenter, setHoveredServiceId }) {
  const isNotAvailable = service.availability?.toLowerCase() === "not available";

  const handleViewLocation = () => {
    if (service.latitude && service.longitude) {
      setMapCenter({ lat: service.latitude, lon: service.longitude });
      setHoveredServiceId(service.id);
    } else {
      alert("Location not available for this service.");
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 hover:scale-[1.02] border border-gray-100 flex flex-col justify-between h-full min-h-[340px]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full shadow-sm">
          <FiSearch className="text-blue-700 text-sm" />
          <span className="text-sm font-semibold text-blue-800">
            {service.category}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
        {service.subcategory}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Description: {service.description}
      </p>

      <div className="text-sm text-gray-600 space-y-1 mb-4">
        <p className="flex items-center gap-1 truncate">
          <FiUser className="text-gray-400" />{" "}
          {service.providerName || service.name}
        </p>
        {service.location && (
          <p className="flex items-center gap-1">📍 {service.location}</p>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span
          className={`w-3 h-3 rounded-full ${
            isNotAvailable ? "bg-gray-400" : "bg-green-500 animate-pulse"
          }`}
        />
        <span className="text-xs font-medium">
          {isNotAvailable ? "Not Available" : service.availability}
        </span>
      </div>

      <button
        onClick={handleViewLocation}
        className="w-full mb-4 text-sm font-semibold text-blue-600 hover:underline flex items-center justify-center gap-1"
      >
        <FiMapPin /> View Location
      </button>

      <div className="border-t border-gray-100 my-3"></div>

      <div className="flex justify-between items-center mt-auto">
        <span className="font-bold text-blue-600 text-lg">₹{service.price}</span>
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
}

function BookingsTab({ bookings }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow">
      <h2 className="text-xl font-semibold mb-3" style={{ color: "#6e290cff" }}>
        My Bookings
      </h2>
      <div className="divide-y divide-gray-200">
        {bookings.map((b) => (
          <div key={b.id} className="flex justify-between py-3">
            <div>
              <p className="font-medium">{b.service}</p>
              <p className="text-sm text-gray-600">Provider: {b.provider}</p>
            </div>
            <span className="px-3 py-1 text-sm rounded-full bg-gray-100">
              {b.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchInput({ icon, placeholder, value, onChange }) {
  return (
    <div className="relative flex-1">
      <div className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 rounded-full border focus:ring-2 focus:ring-blue-400 outline-none text-sm sm:text-base"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ProfileTab({
  customer,
  isEditingProfile,
  setIsEditingProfile,
  editProfileData,
  setEditProfileData,
  handleSaveProfile,
  handleCancelProfile,
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-lg mx-auto border border-gray-100">
      <h2 className="text-2xl font-bold mb-4" style={{ color: "#6e290cff" }}>
        Profile
      </h2>

      {isEditingProfile ? (
        <>
          <input
            type="text"
            value={editProfileData.name}
            onChange={(e) =>
              setEditProfileData((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="Name"
            className="w-full mb-2 border p-2 rounded"
          />
          <input
            type="email"
            value={editProfileData.email}
            onChange={(e) =>
              setEditProfileData((p) => ({ ...p, email: e.target.value }))
            }
            placeholder="Email"
            className="w-full mb-2 border p-2 rounded"
          />
          <input
            type="text"
            value={editProfileData.location}
            onChange={(e) =>
              setEditProfileData((p) => ({ ...p, location: e.target.value }))
            }
            placeholder="Location"
            className="w-full mb-4 border p-2 rounded"
          />

          <div className="flex gap-3">
            <button
              onClick={handleSaveProfile}
              className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition"
            >
              Save
            </button>
            <button
              onClick={handleCancelProfile}
              className="bg-gray-300 px-4 py-2 rounded-full hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-lg font-semibold mb-1">{customer.name}</p>
          <p className="text-sm text-gray-600 mb-1">{customer.email}</p>
          <p className="text-sm text-gray-600 mb-3">{customer.location}</p>
          <button
            onClick={() => setIsEditingProfile(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        </>
      )}
    </div>
  );
}
