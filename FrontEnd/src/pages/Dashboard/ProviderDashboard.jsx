import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiLogOut, FiClock, FiXCircle, FiUser } from "react-icons/fi";
import { BiClipboard } from "react-icons/bi";
import { GiHammerNails } from "react-icons/gi";
import { AiOutlineCheckCircle, AiOutlineRadiusSetting } from "react-icons/ai";
import { FaRegLightbulb } from "react-icons/fa";

import {
  getMyProfile,
  getServicesByProvider,
  updateService,
  deleteService,
  createService,
  getBookingsByProvider,
  updateUser,
  updateBookingStatus,
  getProviderAverageRating,
  getReviewsByProvider,
  deleteReview
  
} from "../../services/api";
import { Md18UpRating, MdReviews } from "react-icons/md";

const rustBrown = "#6e290cff";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [error, setError] = useState(false);
  const [reviews, setReviews] = useState([]);

  

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
   const [editProfileData, setEditProfileData] = useState({
      name: "",
      email: "",
      location: "",
    });

    const [respectScore, setRespectScore] = useState(0);
  const [respectLevel, setRespectLevel] = useState("Newbie");
  const [averageRating, setAverageRating] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: providerData } = await getMyProfile();
        setProvider(providerData);
        setEditProfileData({ ...providerData }); // initialize all fields

        const servicesRes = await getServicesByProvider(providerData.id);
        setServices(servicesRes.data || []);

        const bookingsRes = await getBookingsByProvider(providerData.id);
        const bookingsData = bookingsRes.data || [];
        setBookings(bookingsRes.data || []);
        // Calculate Respect
        const ratingRes = await getProviderAverageRating(providerData.id);
      const avgRating = ratingRes.data || 0;
      setAverageRating(avgRating);

      const reviewsRes = await getReviewsByProvider(providerData.id);
       const reviewsData = reviewsRes.data || [];
      setReviews(reviewsRes.data || []);

      // Calculate Respect Score using average rating from backend
       const completedBookings = bookingsData.filter(b => b.status?.toLowerCase() === "completed").length;
      const pendingBookings = bookingsData.filter(b => b.status?.toLowerCase() === "pending").length;
      const cancelledBookings = bookingsData.filter(b => b.status?.toLowerCase() === "cancelled").length;

      // Assign points: Completed = 5, Pending = 2, Cancelled = 0
      const completedPoints = completedBookings * 5;
      const pendingPoints = pendingBookings * 2;
      const cancelledPoints = cancelledBookings * 0;

      // Weight the average rating by number of reviews (max effect at 5 reviews)
      const reviewCount = reviewsData.length;
      const ratingWeight = Math.min(reviewCount, 5) / 5; // 1 review = 0.2, 5 or more = 1
      const ratingPoints = avgRating * 20 * ratingWeight; // scale to 0-100

      const totalScore = Math.min(100, completedPoints + pendingPoints + cancelledPoints + ratingPoints);
      setRespectScore(totalScore);

      // Determine level
      if (totalScore >= 80) setRespectLevel("Star Performer");
      else if (totalScore >= 50) setRespectLevel("Trusted Provider");
      else setRespectLevel("Newbie");
      } catch (err) {
        console.error("Error fetching provider data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

   const handleSaveProfile = async () => {
  try {
    const res = await updateUser(provider.id, editProfileData); // provider.id must match logged-in user
    setProvider(res.data);
    setIsEditingProfile(false);
    alert("Profile updated successfully!");
  } catch (err) {
    console.error("Failed to update profile:", err);
    alert("Failed to update profile: " + err.response?.data?.message || err.message);
  }
};


   const handleCancelProfile = () => {
    setEditProfileData({ ...customer });
    setIsEditingProfile(false);
  };


  const sidebarItems = [
    { name: "Home", icon: <FiHome className="text-white" />, key: "home" },
    { name: "My Services", icon: <GiHammerNails className="text-white" />, key: "services" },
    { name: "Bookings", icon: <BiClipboard className="text-white" />, key: "bookings" },
    { name: "Profile", icon: <FiUser className="text-white" />, key: "profile" }, 
    { name: "Reviews", icon: <MdReviews className="text-white" />, key: "reviews" }, 

  ];

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-center p-6 text-red-600">Failed to load data. Please refresh.</div>;

  return (
    <div className="flex min-h-screen bg-white text-black">
      {/* Sidebar */}
      <aside className="w-64 p-6 flex flex-col h-screen sticky top-0" style={{ backgroundColor: rustBrown }}>
        <h2 className="text-2xl font-bold mb-6 text-white">FixItNow Provider</h2>
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
      <main className="flex-1 p-6 bg-white">
        {activeTab === "home" && (
          <div className="space-y-6">
            <Greeting provider={provider} />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard title="My Services" value={services.length} icon={<GiHammerNails style={{ color: rustBrown }} />} />
              <MetricCard title="Total Bookings" value={bookings.length} icon={<BiClipboard style={{ color: rustBrown }} />} />
              <MetricCard
                title="Completed Bookings"
                value={bookings.filter(b => b.status?.toLowerCase() === "completed").length}
                icon={<AiOutlineCheckCircle style={{ color: rustBrown }} />}
              />
              <MetricCard
                title="Avg Rating"
                value={averageRating.toFixed(2)}
                icon={<MdReviews style={{ color: rustBrown }} />}
              />
            </div>
            <div className="mt-6 bg-indigo-50 p-5 rounded-xl shadow">
              <h2 className="text-xl font-bold mb-3" style={{ color: rustBrown }}>Respect & Recognition</h2>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1">
                  <p className="text-gray-700 mb-1">Respect Score</p>
                  <div className="bg-gray-200 h-4 rounded-full">
                    <div
                      className="h-4 rounded-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${respectScore}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-800 mt-1 font-semibold">{respectScore} / 100</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-gray-700 mb-1">Level</p>
                  <span className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">{respectLevel}</span>
                </div>
                <div className="flex gap-1 items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Complete bookings and maintain high ratings to increase your Respect Score and level up!
              </p>
            </div>
            <ServicePerformance services={services} bookings={bookings} />
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded shadow flex items-center gap-3">
              <FaRegLightbulb className="text-yellow-700 text-xl" />
              <p className="text-black/80">Respond to new booking requests quickly — providers who respond within an hour get 20% more bookings!</p>
            </div>
            <RecentActivity bookings={bookings} />
          </div>
        )}

        {activeTab === "services" && (
          <ServicesCardFull
            services={services}
            setServices={setServices}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            editingService={editingService}
            setEditingService={setEditingService}
          />
        )}

        {activeTab === "bookings" && (
          <BookingsCard bookings={bookings} setBookings={setBookings} />
        )}

        {activeTab === "profile" && (
  <ProfileTab
  provider={provider}
  setProvider={setProvider}
  isEditingProfile={isEditingProfile}
  setIsEditingProfile={setIsEditingProfile}
  editProfileData={editProfileData}
  setEditProfileData={setEditProfileData}
  handleSaveProfile={handleSaveProfile}
  handleCancelProfile={handleCancelProfile}
/>
)}

{activeTab === "reviews" && (
  <ReviewsTab reviews={reviews}
   />
)}


      </main>
    </div>
  );
}

// Greeting Component
function Greeting({ provider }) {
  const hours = new Date().getHours();
  const greeting =
    hours < 12 ? "Good Morning" :
    hours < 16 ? "Good Afternoon" :
    hours < 18 ? "Good Evening":
    "Good Night";

  return (
    <h1 className="text-3xl font-bold mb-4" style={{ color: rustBrown }}>
      {greeting}, {provider?.name || "Provider"}!
    </h1>
  );
}

// Metric Card
function MetricCard({ title, value, icon }) {
  return (
    <div
      className="bg-white border p-5 rounded-xl shadow-md flex flex-col items-center justify-center gap-3"
      style={{ borderColor: rustBrown + "40" }}
    >
      <div className="text-3xl">{icon}</div>
      <h2 className="text-2xl font-bold">{value}</h2>
      <p className="text-sm text-black/70">{title}</p>
    </div>
  );
}

// Services Card
function ServicesCardFull({ services, setServices, modalOpen, setModalOpen, editingService, setEditingService }) {
  const [newService, setNewService] = useState({
    category: "",
    subcategory: "",
    description: "",
    price: 0,
    availability: "",
    location: "",
  });

  const openAddModal = () => {
    setEditingService(null);
    setNewService({ category: "", subcategory: "", description: "", price: 0, availability: "", location: "" });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setNewService(service);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!newService.category || !newService.subcategory || !newService.description || !newService.price || !newService.availability || !newService.location) {
      alert("Please fill all fields including availability and location");
      return;
    }

    try {
      if (editingService) {
        await updateService(editingService.id, newService);
        setServices(services.map(s => s.id === editingService.id ? newService : s));
      } else {
        const res = await createService(newService);
        setServices([...services, res.data]);
      }
      setModalOpen(false);
      setNewService({ category: "", subcategory: "", description: "", price: 0, availability: "", location: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to save service.");
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={openAddModal}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition mb-4"
      >
        Add Service
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(service => (
          <div key={service.id} className="bg-white border rounded-xl p-5 shadow hover:shadow-lg transition" style={{ borderColor: rustBrown + "40" }}>
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{service.category} - {service.subcategory}</h3>
            </div>
            <p className="text-sm mt-2">{service.description}</p>
            <p className="text-sm text-black/60"><b>Availability:</b> {service.availability}</p>
            <p className="text-sm text-black/60"><b>Location:</b> {service.location}</p>
            <p className="font-semibold text-lg mt-2">₹{service.price}</p>

            <div className="flex gap-3 mt-2">
              <button onClick={() => openEditModal(service)} className="bg-gray-600 text-white px-3 py-1 rounded">Edit</button>
              <button onClick={async () => {
                if (!window.confirm("Delete service?")) return;
                await deleteService(service.id);
                setServices(services.filter(s => s.id !== service.id));
              }} className="bg-[#B7410E] text-white px-3 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-xl">&times;</button>
            <h2 className="text-xl font-bold mb-4">{editingService ? "Edit Service" : "Add Service"}</h2>

            <select
              value={newService.category}
              onChange={(e) => setNewService({ ...newService, category: e.target.value, subcategory: "" })}
              className="w-full px-4 py-2 mb-3 border rounded-md"
            >
              <option value="">Select Category</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Cleaning">Cleaning</option>
            </select>

            <select
              value={newService.subcategory}
              onChange={(e) => setNewService({ ...newService, subcategory: e.target.value })}
              className="w-full px-4 py-2 mb-3 border rounded-md"
            >
              <option value="">Select Subcategory</option>
              {newService.category === "Plumbing" && <>
                <option value="Pipe Repair">Pipe Repair</option>
                <option value="Faucet Installation">Faucet Installation</option>
              </>}
              {newService.category === "Electrical" && <>
                <option value="Wiring">Wiring</option>
                <option value="Appliance Repair">Appliance Repair</option>
              </>}
              {newService.category === "Carpentry" && <option value="Furniture Repair">Furniture Repair</option>}
              {newService.category === "Cleaning" && <option value="Home Cleaning">Home Cleaning</option>}
            </select>

            <textarea
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              placeholder="Description"
              className="w-full px-4 py-2 mb-3 border rounded-md resize-none"
              rows={3}
            />
            <input
              type="number"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
              placeholder="Price"
              className="w-full px-4 py-2 mb-3 border rounded-md"
            />
            <input
              type="text"
              value={newService.availability}
              onChange={(e) => setNewService({ ...newService, availability: e.target.value })}
              placeholder="Availability"
              className="w-full px-4 py-2 mb-3 border rounded-md"
            />

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newService.location}
                onChange={(e) => setNewService({ ...newService, location: e.target.value })}
                placeholder="Location"
                className="flex-1 px-4 py-2 border rounded-md"
              />
              <button onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(async pos => {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                    const data = await res.json();
                    setNewService(prev => ({ ...prev, location: data.display_name || `Lat: ${latitude}, Lon: ${longitude}` }));
                  });
                } else alert("Geolocation not supported");
              }} className="px-2 py-2 rounded-md text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-transform transform hover:scale-105">Use Current</button>
            </div>

            <button onClick={handleSave} className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">{editingService ? "Update Service" : "Add Service"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Service Performance
// ServicePerformance.jsx
function ServicePerformance({ services, bookings }) {
  if (!services || services.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Service Performance</h2>
      <div className="flex flex-col gap-3">
        {services.map(service => {
          const completedBookings = bookings.filter(
            b => b.service?.id === service.id && b.status?.toLowerCase() === "completed"
          ).length;
          const totalBookings = bookings.filter(
            b => b.service?.id === service.id
          ).length;
          const progress = totalBookings ? (completedBookings / totalBookings) * 100 : 0;

          // Determine progress bar color
          const progressColor =
            progress === 100
              ? "#16a34a" // green
              : progress >= 50
              ? "#facc15" // yellow
              : "#dc2626"; // red

          return (
            <div key={service.id} className="bg-white p-4 rounded-xl shadow flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">{service.category} - {service.subcategory}</span>
                <span className="text-sm text-gray-600">{completedBookings}/{totalBookings} completed</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full mt-1">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: progressColor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// Recent Activity
function RecentActivity({ bookings }) {
  if (!bookings || bookings.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
      <div className="flex flex-col gap-2">
        {bookings.slice(0, 5).map(b => (
          <div key={b.id} className="bg-white p-3 rounded shadow flex justify-between items-center">
            <span>{b.customer?.name  || "Unknown"}</span>
<p>{b.service?.category} - {b.service?.subcategory}</p>

            <span className="text-sm text-gray-500">{b.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bookings Card
function BookingsCard({ bookings, setBookings }) {

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-semibold">
            <AiOutlineCheckCircle /> {status}
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-semibold">
            <FiClock /> {status}
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-semibold">
            <FiXCircle /> {status}
          </span>
        );
      default:
        return <span className="px-2 py-1 bg-gray-100 rounded-full">{status}</span>;
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      // Call backend endpoint
      await updateBookingStatus(bookingId, newStatus);

      // Update UI state immediately
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));
    } catch (err) {
      console.error(err);
      alert("Failed to update booking status.");
    }
  };

  if (!bookings || bookings.length === 0) {
    return <p className="text-black/70 mt-4">No bookings available.</p>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: rustBrown }}>
        <BiClipboard /> My Bookings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-white border-l-4 rounded-xl p-5 shadow hover:shadow-lg transition flex flex-col gap-3"
            style={{
              borderColor:
                b.status?.toLowerCase() === "pending"
                  ? "#facc15"
                  : b.status?.toLowerCase() === "completed"
                  ? "#16a34a"
                  : "#dc2626",
            }}
          >
            <div className="flex col items-center gap-3">
              <FiUser/>
              <h3 className="font-semibold text-lg">
                
                {b.customer?.name || b.customer?.username || "Unknown"}
              </h3>
              {getStatusBadge(b.status)}
            </div>

            <p className="text-sm text-gray-700">
              <span className="font-semibold">{b.service?.category}</span> - {b.service?.subcategory}
            </p>
            <p className="text-sm text-gray-600">{b.service?.description}</p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Date:</span> {b.bookingDate} | <span className="font-semibold">Time:</span> {b.timeSlot}
            </p>

            {b.status?.toLowerCase() === "pending" && (
              <div className="flex gap-2 mt-2">
                <button
                  className="flex-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition"
                  onClick={() => handleStatusUpdate(b.id, "COMPLETED")}
                >
                  Accept
                </button>
                <button
                  className="flex-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                  onClick={() => handleStatusUpdate(b.id, "CANCELLED")}
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab({
  provider,
  isEditingProfile,
  setIsEditingProfile,
  editProfileData,
  setEditProfileData,
  setProvider,
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSaveProfile = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Send all existing fields + edited fields
      const updatedProfile = { ...provider, ...editProfileData };
      const res = await updateUser(provider.id, updatedProfile);
      setProvider(res.data); // update parent state
      setEditProfileData({ ...res.data }); // reset edit form
      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setErrorMsg(err.response?.data?.message || "Failed to save profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelProfile = () => {
    setEditProfileData({ ...provider }); // revert to full provider data
    setIsEditingProfile(false);
    setErrorMsg("");
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow w-full max-w-md relative">
      <h2 className="text-xl font-semibold mb-4" style={{ color: rustBrown }}>My Profile</h2>
      {errorMsg && <p className="text-red-600 mb-2">{errorMsg}</p>}
      <div className="flex flex-col gap-2">
        {isEditingProfile ? (
          <>
            <input
              type="text"
              value={editProfileData.name || ""}
              onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
              className="border px-3 py-2 rounded"
              placeholder="Name"
            />
            <input
              type="email"
              value={editProfileData.email || ""}
              onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
              className="border px-3 py-2 rounded"
              placeholder="Email"
            />
            <input
              type="text"
              value={editProfileData.location || ""}
              onChange={(e) => setEditProfileData({ ...editProfileData, location: e.target.value })}
              className="border px-3 py-2 rounded"
              placeholder="Location"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSaveProfile}
                className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancelProfile}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p><strong>Name:</strong> {provider.name}</p>
            <p><strong>Email:</strong> {provider.email}</p>
            <p><strong>Location:</strong> {provider.location || "N/A"}</p>
            <button
              onClick={() => setIsEditingProfile(true)}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ReviewsTab({ reviews }) {
  const [allReviews, setAllReviews] = useState(reviews || []);
  const [replyText, setReplyText] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to post a reply
  const handleReply = async () => {
    if (!replyText || !selectedReview) return;
    setLoading(true);
    try {
      // Call backend API
      await addReviewReply(selectedReview.id, { reply: replyText });

      // Update local state to show reply immediately
      setAllReviews(allReviews.map(r =>
        r.id === selectedReview.id ? { ...r, reply: replyText } : r
      ));

      setReplyText("");
      setSelectedReview(null);
    } catch (err) {
      console.error(err);
      alert("Failed to reply to review.");
    } finally {
      setLoading(false);
    }
  };

  // Function to delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteReview(reviewId); // make sure this API exists in your services/api
      setAllReviews(allReviews.filter(r => r.id !== reviewId));
      alert("Review deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete review.");
    }
  };

  if (!allReviews || allReviews.length === 0) return <p>No reviews yet.</p>;

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4" style={{ color: rustBrown }}>Customer Reviews</h2>
      <div className="flex flex-col gap-4">
        {allReviews.map((r) => (
          <div key={r.id} className="bg-white border rounded-xl p-4 shadow flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{r.customer?.name || "Anonymous"}</span>
              <span className="text-yellow-400">{'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}</span>
            </div>
            <p className="text-gray-700">{r.comment}</p>

            <div className="text-sm text-gray-500 flex gap-2 flex-wrap">
              {r.service?.category && <span className="px-2 py-1 bg-gray-200 rounded">{`Category: ${r.service.category}`}</span>}
              {r.service?.subcategory && <span className="px-2 py-1 bg-gray-200 rounded">{`Subcategory: ${r.service.subcategory}`}</span>}
              
            </div>

            

            {/* Delete Review Button */}
            <div className="flex justify-end">
              <button
                onClick={() => handleDeleteReview(r.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
