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
  FiCalendar, FiClock,
  
} from "react-icons/fi";
import { MdMiscellaneousServices } from "react-icons/md";
import { BiHistory } from "react-icons/bi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import {
  getAllServices,
  getMyProfile,
  getBookingsByCustomer,
  createBooking,
  addReview, 
  getReviewsByProvider, 
  getProviderAverageRating 
} from "../../services/api";
import MapView from "../../components/MapView";
import { FaSitemap } from "react-icons/fa";

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
  const [sortOption, setSortOption] = useState("rating");
  const [hoveredServiceId, setHoveredServiceId] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  // For review modal
const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
const [reviewService, setReviewService] = useState(null);
const [reviews, setReviews] = useState([]);
const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
const [averageRating, setAverageRating] = useState(0);

  const [editProfileData, setEditProfileData] = useState({
    name: "",
    email: "",
    location: "",
  });

  // --- Booking modal states
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const fetchReviews = async (providerId) => {
  try {
    const res = await getReviewsByProvider(providerId);
    setReviews(res.data);

    const avgRes = await getProviderAverageRating(providerId);
    setAverageRating(avgRes.data || 0);
  } catch (err) {
    console.error("Failed to fetch reviews:", err);
  }
};

const openReviewModal = (service) => {
  setReviewService(service);
  fetchReviews(service.providerId || service.id);
  setIsReviewModalOpen(true);
};

const handleSubmitReview = async () => {
  if (!newReview.comment) return alert("Please write a comment.");
  
  try {
    await addReview({
      customer: { id: customer.id },
      provider: { id: reviewService.providerId || reviewService.id },
      service: { id: reviewService.id },
      rating: newReview.rating,
      comment: newReview.comment,
    });

    alert("Review submitted!");
    setNewReview({ rating: 5, comment: "" });
    fetchReviews(reviewService.providerId || reviewService.id); // refresh
  } catch (err) {
    console.error(err);
    alert("Failed to submit review.");
  }
};


  // --- 🚀 Fetch all data quickly and lazy-load geocodes
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const profileRes = await getMyProfile();
        const servicesRes = await getAllServices();
        const bookingsRes = await getBookingsByCustomer(profileRes.data.id);

        const user = profileRes.data;
        setCustomer(user);
        setEditProfileData({
          name: user.name || "",
          email: user.email || "",
          location: user.location || "",
        });

        if (user.location) {
  const userCoords = await geocodeLocation(user.location);
   
  if (userCoords) {
    setCustomer((prev) => ({
      ...prev,
      latitude: userCoords.latitude,
      longitude: userCoords.longitude,
    }));
  }
}

        setServices(servicesRes.data);

        Promise.all(
          servicesRes.data.map(async (s) => {
            const coords = await geocodeLocation(s.location);
            return { ...s, ...coords };
          })
        ).then((updated) => {
          setServices(updated);
        });

        setBookings(bookingsRes.data);
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

  const filteredSortedServices = services
  .filter(
    (s) =>
      s.category?.toLowerCase().includes(categorySearch.toLowerCase()) &&
      s.location?.toLowerCase().includes(locationSearch.toLowerCase())
  )
  .map((s) => ({
    ...s,
    distance:
      customer?.latitude && s.latitude && s.longitude
        ? getDistance(customer.latitude, customer.longitude, s.latitude, s.longitude).toFixed(1)
        : null,
  }))
  .sort((a, b) => {
    if (sortOption === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortOption === "distance") return (a.distance || 0) - (b.distance || 0);
    if (sortOption === "price") return a.price - b.price;
    return 0;
  });

  function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}



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
    <h1 className="text-3xl font-bold mb-4">Welcome, {customer.name} 👋 </h1>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard title="Total Bookings" value={bookings.length} icon={<FiClipboard style={{ color: rustBrown }} />} />
      <MetricCard title="Available Services" value={services.length} icon={<MdMiscellaneousServices style={{ color: rustBrown }} />} />
      <MetricCard
  title="Completed Bookings"
  value={bookings.filter(b => b.status?.toLowerCase() === "completed").length}
  icon={<AiOutlineCheckCircle style={{ color: rustBrown }} />}
/>

    </div>

    {/* Sorting options */}
    <div className="flex items-center gap-3 mb-4">
      <span className="font-semibold">Sort by:</span>
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
        className="border px-2 py-1 rounded"
      >
        <option value="rating">Rating</option>
        <option value="distance">Distance</option>
        <option value="price">Price</option>
      </select>
    </div>

    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4" style={{ color: rustBrown }}>Top Providers Near You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSortedServices.slice(0, 4).map((s) => (
          <div key={s.id} className="flex justify-between items-center p-4 rounded-lg shadow hover:shadow-lg transition bg-gradient-to-r from-orange-50 to-white">
            <div>
              <p className="font-bold">{s.providerName}</p>
              <p className="text-sm text-gray-600">{s.category}</p>
              {s.distance && <p className="text-xs text-gray-500">{s.distance} km away</p>}
            </div>
            <span className="text-yellow-500 font-semibold">★ {s.rating}</span>
           
          </div>
        ))}
      </div>
    </div>

    {/* Recommended Services */}
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4" style={{ color: rustBrown }}>Recommended For You</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredSortedServices.slice(0, 3).map((s) => (
          <ServiceCard
            key={s.id}
            service={s}
            setMapCenter={() => {}}
            setHoveredServiceId={() => {}}
            setSelectedService={setSelectedService}
            setIsBookingModalOpen={setIsBookingModalOpen}
          />
        ))}
      </div>
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
              setSelectedService={setSelectedService}
              setIsBookingModalOpen={setIsBookingModalOpen}
              openReviewModal={openReviewModal}
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

      {/* Booking Form Modal */}
      {isBookingModalOpen && selectedService && (
        <BookingFormModal
          service={selectedService}
          customer={customer}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedService(null);
          }}
        />
      )}

      {isReviewModalOpen && (
  <ReviewModal
    service={reviewService}
    reviews={reviews}
    averageRating={averageRating}
    onClose={() => setIsReviewModalOpen(false)}
    newReview={newReview}
    setNewReview={setNewReview}
    onSubmit={handleSubmitReview}
  />
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
  setSelectedService,
  setIsBookingModalOpen,
  customer, // customer object for distance calculation
  openReviewModal, 
}) {
  const [mapCenter, setMapCenter] = useState(null);
  const [sortOption, setSortOption] = useState("distance");
  const [searchRadius, setSearchRadius] = useState(5); // default 5 km radius
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapCenter && mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [mapCenter]);

  // --- Haversine formula for distance
  function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

  // --- Filter services by category, location, and within radius
  const filteredSortedServices = services
    .filter((s) => {
      const matchesCategory = s.category?.toLowerCase().includes(categorySearch.toLowerCase());
      const matchesLocation = s.location?.toLowerCase().includes(locationSearch.toLowerCase());
      let withinRadius = true;

      if (
        customer?.latitude &&
        customer?.longitude &&
        s.latitude &&
        s.longitude &&
        searchRadius
      ) {
        const distance = getDistance(
          customer.latitude,
          customer.longitude,
          s.latitude,
          s.longitude
        );
        withinRadius = distance <= searchRadius;
      }

      return matchesCategory && matchesLocation && withinRadius;
    })
    .map((s) => ({
      ...s,
      distance:
        customer?.latitude && s.latitude && s.longitude
          ? getDistance(customer.latitude, customer.longitude, s.latitude, s.longitude).toFixed(1)
          : null,
    }))
    .sort((a, b) => {
      if (sortOption === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortOption === "distance") return (a.distance || 0) - (b.distance || 0);
      if (sortOption === "price") return a.price - b.price;
      return 0;
    })

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

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 max-w-4xl mx-auto">
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
          services={filteredSortedServices}
          hoveredServiceId={hoveredServiceId}
          center={mapCenter}
        />
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {filteredSortedServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            setMapCenter={setMapCenter}
            setHoveredServiceId={setHoveredServiceId}
            setSelectedService={setSelectedService}
            setIsBookingModalOpen={setIsBookingModalOpen}
            openReviewModal={openReviewModal}
          />
        ))}
      </div>
    </div>
  );
}



function ServiceCard({ service, setMapCenter, setHoveredServiceId }) {
  const navigate = useNavigate();
  const isNotAvailable = service.availability?.toLowerCase() === "not available";

  const handleViewLocation = () => {
    if (service.latitude && service.longitude) {
      setMapCenter({ lat: service.latitude, lon: service.longitude });
      setHoveredServiceId(service.id);
    } else {
      alert("Location not available for this service.");
    }
  };

  const handleViewDetails = () => {
    // Navigate to provider detail page
    navigate(`/provider/${service.providerId || service.id}`);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 hover:scale-[1.02] border border-gray-100 flex flex-col justify-between h-full min-h-[340px]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full shadow-sm">
          <FiSearch className="text-blue-700 text-sm" />
          <span className="text-sm font-semibold text-blue-800">{service.category}</span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{service.subcategory}</h3>
      <p className="text-sm text-gray-600 mb-4">Description: {service.description}</p>

      <div className="text-sm text-gray-600 space-y-1 mb-4">
        <p className="flex items-center gap-1 truncate">
          <FiUser className="text-gray-400" /> {service.providerName || service.name}
        </p>
        {service.location && <p className="flex items-center gap-1">📍 {service.location}</p>}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span
          className={`w-3 h-3 rounded-full ${
            isNotAvailable ? "bg-gray-400" : "bg-green-500 animate-pulse"
          }`}
        />
        <span className="text-xs font-medium">{isNotAvailable ? "Not Available" : service.availability}</span>
      </div>

      <button
        onClick={handleViewLocation}
        className="w-full mb-2 text-sm font-semibold text-blue-600 hover:underline flex items-center justify-center gap-1"
      >
        <FiMapPin /> View Location
      </button>

      <div className="border-t border-gray-100 my-3"></div>

      <div className="flex justify-between items-center mt-auto">
        <span className="font-bold text-blue-600 text-lg">₹{service.price}</span>
        <button
          onClick={handleViewDetails}
          className="px-6 py-2 rounded-full font-semibold text-white shadow-md transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-blue-700"
        >
          View Details
        </button>
      </div>
    </div>
  );
}


function BookingsTab({ bookings }) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">My Bookings</h2>
        <p className="text-gray-500 text-lg">You have no bookings yet.</p>
      </div>
    );
  }

  // ✅ Define clean color mapping for statuses
  const statusColors = {
    completed: "bg-green-100 text-green-800 border border-green-300",
    confirmed: "bg-green-100 text-green-800 border border-green-300",
    pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    cancelled: "bg-red-100 text-red-800 border border-red-300",
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">My Bookings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((b) => {
          const bookingDate = new Date(b.bookingDate);
          const today = new Date();
          const isPast = bookingDate < today;
          const cardBg = isPast ? "bg-gray-50" : "bg-white";

          // Normalize status (lowercase for safety)
          const status = b.status?.toLowerCase();

          // Border color based on status
          const borderColor =
            status === "completed" || status === "confirmed"
              ? "border-green-400"
              : status === "pending"
              ? "border-yellow-400"
              : "border-red-400";

          return (
            <div
              key={b.id}
              className={`${cardBg} rounded-2xl shadow-lg p-5 hover:shadow-2xl transition flex flex-col justify-between border-t-4 ${borderColor}`}
            >
              {/* Booking details */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                  {b.service?.subcategory || "Service Name"}
                </h3>

                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <FiUser className="text-blue-600" /> Provider:{" "}
                  {b.provider?.name || "Unknown"}
                </p>

                <p className="text-sm text-gray-600 mb-1 flex items-start gap-1">
                  
                  {b.service?.location || "Location N/A"}
                </p>

                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <FiCalendar className="text-green-600" /> {b.bookingDate}
                </p>

                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <FiClock className="text-purple-600" /> {b.timeSlot}
                </p>
              </div>

              {/* Footer section */}
              <div className="flex justify-between items-center mt-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
                    statusColors[status] || "bg-gray-100 text-gray-800 border"
                  }`}
                >
                  {b.status?.toUpperCase()}
                </span>

                <span className="text-blue-600 font-semibold text-lg">
                  ₹{b.service?.price}
                </span>
              </div>
            </div>
          );
        })}
      </div>
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
    
    <div className="bg-white p-6 rounded-xl border shadow w-full max-w-md relative">
      <h2 className="text-xl font-semibold mb-4" style={{ color: rustBrown }}>My Profile</h2>
      <div className="flex flex-col gap-2">
        {isEditingProfile ? (
          <>
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
            <div className="flex gap-2 mt-3">
              <button onClick={handleSaveProfile} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
              <button onClick={handleCancelProfile} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
            </div>
          </>
        ) : (
          <>
            <p><strong>Name:</strong> {customer.name}</p>
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Location:</strong> {customer.location}</p>
            
            <button onClick={() => setIsEditingProfile(true)} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit Profile</button>
          </>
        )}
      </div>
    </div>
  );
}

function SearchInput({ icon, placeholder, value, onChange }) {
  return (
    <div className="flex items-center border rounded px-3 py-2 bg-white shadow-sm w-full max-w-md">
      {icon}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ml-2 w-full focus:outline-none"
      />
    </div>
  );
}

function BookingFormModal({ service, customer, onClose }) {
  const [formData, setFormData] = useState({
    bookingDate: "",
    timeSlot: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!formData.bookingDate || !formData.timeSlot) {
      setMessage("Please select both date and time slot.");
      setLoading(false);
      return;
    }

    try {
      const bookingData = {
        customer: { id: customer.id },
        provider: { id: service.providerId || service.id }, // fixed providerId
        service: { id: service.id },
         bookingDate: formData.bookingDate, // send only the date part
  timeSlot: formData.timeSlot, 
        notes: formData.notes,
        status: "PENDING",
      };

      const res = await createBooking(bookingData); // call API
      console.log("Booking successful:", res.data);

      setMessage("Booking successful!");
      alert("Booking confirmed!");
      onClose(); // close modal
    } catch (err) {
      console.error("Booking failed:", err.response?.data || err.message);
      setMessage("Booking failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">
          Book Service: {service.subcategory}
        </h2>

        <div className="space-y-4">
          <p className="text-gray-700 text-sm">
            <strong>Provider:</strong> {service.providerName || "Unknown"}
          </p>
          <p className="text-gray-700 text-sm">
            <strong>Price:</strong> ₹{service.price}
          </p>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Booking Date</label>
            <input
              type="date"
              value={formData.bookingDate}
              onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
              className="border w-full px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Time Slot</label>
            <select
              value={formData.timeSlot}
              onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
              className="border w-full px-3 py-2 rounded"
            >
              <option value="">Select a time</option>
              <option value="9AM - 11AM">9AM - 11AM</option>
              <option value="11AM - 1PM">11AM - 1PM</option>
              <option value="2PM - 4PM">2PM - 4PM</option>
              <option value="4PM - 6PM">4PM - 6PM</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="border w-full px-3 py-2 rounded"
              placeholder="Any special instructions?"
            />
          </div>

          <button
            onClick={handleBookingSubmit}
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>

          {message && (
            <p
              className={`text-center mt-2 font-medium ${
                message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ service, reviews, averageRating, onClose, newReview, setNewReview, onSubmit }) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        <h2 className="text-xl font-semibold mb-2">{service.subcategory} - Reviews</h2>
        <p className="text-sm text-gray-600 mb-4">Average Rating: {averageRating.toFixed(1)} ⭐</p>

        <div className="max-h-64 overflow-y-auto mb-4 space-y-2">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="border-b py-2">
                <p className="font-semibold text-gray-800">Rating: {r.rating} ⭐</p>
                <p className="text-gray-700">{r.comment}</p>
                <p className="text-xs text-gray-400">By: {r.customer?.name || "Anonymous"}</p>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-3">
          <h3 className="font-semibold mb-1">Add Your Review</h3>
          <div className="flex items-center mb-2 gap-2">
            <label>Rating:</label>
            <select
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
              className="border px-2 py-1 rounded"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            className="border w-full px-3 py-2 rounded mb-2"
            placeholder="Write your review..."
          />
          <button
            onClick={onSubmit}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}


