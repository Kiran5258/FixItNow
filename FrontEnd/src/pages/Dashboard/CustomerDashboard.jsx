// src/pages/Dashboard/CustomerDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiLogOut, FiUser } from "react-icons/fi";
import { MdMiscellaneousServices } from "react-icons/md";
import { BiHistory } from "react-icons/bi";

import { getAllServices, getMyProfile, createBooking } from "../../services/api";

// Tab components
import HomeTab from "../../components/HomeTab";
import ServicesTab from "../../components/ServicesTab";
import BookingsTab from "../../components/BookingsTab";
import ProfileTab from "../../components/ProfileTab";

// --- 🔁 Simple geocode cache to prevent re-fetching same locations
const geoCache = {};

const geocodeLocation = async (location) => {
  if (!location) return null;
  if (geoCache[location]) return geoCache[location]; // use cached
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
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
        const [profileRes, servicesRes] = await Promise.all([getMyProfile(), getAllServices()]);

        const user = profileRes.data;
        setCustomer(user);
        setEditProfileData({
          name: user.name || "",
          email: user.email || "",
          location: user.location || "",
        });

        setServices(servicesRes.data);

        // Lazy geocoding
        Promise.all(
          servicesRes.data.map(async (s) => {
            const coords = await geocodeLocation(s.location);
            return { ...s, ...coords };
          })
        ).then((updated) => setServices(updated));

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

  const handleBookService = async (service) => {
    if (!customer) return;

    if (service.availability?.toLowerCase() === "not available") {
      alert("This service is not available right now.");
      return;
    }

    try {
      const bookingPayload = {
        customerId: customer.id,
        serviceId: service.id,
        serviceName: service.subcategory,
        providerName: service.providerName,
        status: "Confirmed",
      };

      const res = await createBooking(bookingPayload);
      setBookings((prev) => [...prev, res.data]);
      alert("Booking successful!");
    } catch (err) {
      console.error("Error booking service:", err);
      alert("Failed to book service. Try again.");
    }
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
          {activeTab === "home" && (
            <HomeTab
              customer={customer}
              bookings={bookings}
              services={services}
              handleBookService={handleBookService}
            />
          )}
          {activeTab === "services" && (
            <ServicesTab
              services={filteredServices}
              hoveredServiceId={hoveredServiceId}
              setHoveredServiceId={setHoveredServiceId}
              categorySearch={categorySearch}
              setCategorySearch={setCategorySearch}
              locationSearch={locationSearch}
              setLocationSearch={setLocationSearch}
              handleBookService={handleBookService}
            />
          )}
          {activeTab === "bookings" && <BookingsTab bookings={bookings} />}
          {activeTab === "profile" && (
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
