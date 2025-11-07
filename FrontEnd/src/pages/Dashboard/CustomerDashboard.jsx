// src/pages/Dashboard/CustomerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatNotifications from "../../components/ChatNotifications";
import { FiHome, FiLogOut, FiClipboard, FiUser, FiMessageCircle,FiX } from "react-icons/fi";
import ChatComponent from "../../components/ChatComponent";
import { MdMiscellaneousServices } from "react-icons/md";
import { BiHistory } from "react-icons/bi";
import { AiOutlineCheckCircle } from "react-icons/ai";

import {
  getAllServices,
  getMyProfile,
  getBookingsByCustomer,
  getReviewByBookingId,
  addReview,
  getProviderAverageRating,
  updateUser,
  verifyBookingByCustomer,
} from "../../services/api";

// Theme color used across the dashboard
const rustBrown = "#6e290cff";

// Re-import split components (moved during refactor)
import MetricCard from "./components/Admin/MetricCard";
import ServicesTab from "./components/Customer/ServicesTab";
import ServiceCard from "./components/Customer/ServiceCard";
import BookingsTab from "./components/Customer/BookingsTab";
import ProfileTab from "./components/Customer/ProfileTab";
import BookingFormModal from "./components/Customer/BookingFormModal";
import ReviewModal from "./components/Customer/ReviewModal";
import ReportsTab from "./components/Customer/ReportsTab";

// --- small geocode cache + helpers used by the dashboard
const geoCache = JSON.parse(localStorage.getItem("geoCache") || "{}");
let lastRequestTime = 0;
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const saveCache = () => localStorage.setItem("geoCache", JSON.stringify(geoCache));

async function geocodeLocation(location) {
  if (!location) return null;
  if (geoCache[location]) return geoCache[location];

  // throttle requests to avoid rate limits. reduced slightly to speed up
  // local development while still being polite to the Nominatim API.
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  const minInterval = 600; // ms between requests
  if (elapsed < minInterval) await sleep(minInterval - elapsed);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
    );
    lastRequestTime = Date.now();
    const data = await res.json();
    if (data && data.length > 0) {
      const coords = { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
      geoCache[location] = coords;
      saveCache();
      return coords;
    }
  } catch (err) {
    console.error("Geocoding error:", err);
  }
  return null;
}

// Haversine distance in kilometers
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


export default function CustomerDashboard() {
  const navigate = useNavigate();

  // core UI state
  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [servicesWithDistance, setServicesWithDistance] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewService, setReviewService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [newReview, setNewReview] = useState("");
  const [showAdminChat, setShowAdminChat] = useState(false);
  const [hoveredServiceId, setHoveredServiceId] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [sortOption, setSortOption] = useState("rating");
  const [activeTab, setActiveTab] = useState("home");
  const [token] = useState((localStorage.getItem("token") || "").trim());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({});
  const [reviewsMap, setReviewsMap] = useState({});

  // Small helper to open review modal
  const openReviewModal = (service) => {
    setReviewService(service);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewService) return;
    try {
      const res = await addReview({ serviceId: reviewService.id, content: newReview });
      const created = res?.data;
      // Update reviewsMap so BookingsTab no longer shows "Leave a Review"
      try {
        // Try to derive booking id from the created review
        const bookingId = created?.bookingId ?? created?.booking?.id ?? created?.booking?.bookingId ?? created?.booking_id ?? created?.booking?.booking_id;
        if (bookingId) {
          setReviewsMap((prev) => ({ ...prev, [bookingId]: true }));
        } else {
          // Fallback: match by service id to mark the corresponding booking as reviewed
          const svcId = created?.serviceId ?? reviewService.id;
          if (svcId) {
            setReviewsMap((prev) => {
              const copy = { ...prev };
              const matched = bookings.find((b) => b.service?.id === svcId || b.service?.serviceId === svcId);
              if (matched) copy[matched.id] = true;
              return copy;
            });
          }
        }
      } catch (e) {
        console.warn('Could not update reviewsMap after creating review:', e);
      }

      setIsReviewModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const profileRes = await getMyProfile();
        const profileData = profileRes.data || null;
        setCustomer(profileData);

        // Guard the bookings call: derive customer id from profile and only call if available
        const customerId = profileData?.id ?? profileData?.userId ?? profileData?.customerId;
        if (customerId) {
          const bRes = await getBookingsByCustomer(customerId);
          const bookingsData = bRes.data || [];
          setBookings(bookingsData);

          // Build reviewsMap by checking each booking for an associated review.
          // We avoid calling the customer-level endpoint to prevent server 500s
          // from surfacing in the client; per-booking checks are smaller and
          // tolerate a broken customer endpoint on the server.
          try {
            const map = {};
            const checks = await Promise.allSettled(
              bookingsData.map((b) => getReviewByBookingId(b.id))
            );
            checks.forEach((res, idx) => {
              if (res.status === 'fulfilled' && res.value && res.value.status === 200) {
                const bookingId = bookingsData[idx].id;
                map[bookingId] = true;
              }
            });
            setReviewsMap(map);
          } catch (e) {
            // If checks fail, fallback to empty map so 'Leave a Review' may show.
            setReviewsMap({});
          }
        } else {
          // Avoid calling the API with `undefined` and default to empty bookings
          setBookings([]);
          setReviewsMap({});
        }

  const sRes = await getAllServices();
  const servicesData = sRes.data || [];
        setServices(servicesData);
        // Immediately set servicesWithDistance with whatever coords are present
        // so the map can render quickly for items that already have lat/lon.
        setServicesWithDistance(
          servicesData.map((s) => ({
            ...s,
            latitude: s.latitude ?? s.lat ?? null,
            longitude: s.longitude ?? s.lon ?? null,
            distance: null,
          }))
        );

        // Background: resolve missing coordinates, compute distances and fetch ratings.
        (async () => {
          try {
            // Derive customer coordinates from profile if possible
            let customerCoords = null;
            const custLoc = profileData?.location || profileData?.address || profileData?.city;
            if (custLoc) {
              const cgeo = await geocodeLocation(custLoc);
              if (cgeo) customerCoords = { lat: cgeo.latitude, lon: cgeo.longitude };
            }

            const updated = [...servicesData];
            // build unique locations to geocode to avoid duplicate requests
            const locMap = new Map();
            updated.forEach((s, idx) => {
              if (!s.latitude && s.location) {
                if (!locMap.has(s.location)) locMap.set(s.location, []);
                locMap.get(s.location).push(idx);
              }
            });

            for (const [location, idxs] of locMap.entries()) {
              const geo = await geocodeLocation(location);
              if (geo) {
                idxs.forEach((i) => {
                  updated[i].latitude = geo.latitude;
                  updated[i].longitude = geo.longitude;
                });
              }
              // update intermediate state so UI progressively improves
              setServicesWithDistance((prev) =>
                prev.map((p) => {
                  const found = updated.find((u) => u.id === p.id);
                  if (!found) return p;
                  const lat = found.latitude ?? p.latitude;
                  const lon = found.longitude ?? p.longitude;
                  const dist = customerCoords && lat && lon ? haversineKm(customerCoords.lat, customerCoords.lon, lat, lon) : p.distance;
                  return { ...p, latitude: lat, longitude: lon, distance: dist ? Math.round(dist * 10) / 10 : null };
                })
              );
            }

            // Fetch provider average ratings in parallel (unique providers)
            const providerIds = Array.from(new Set(updated.map((s) => s.providerId).filter(Boolean)));
            const ratingPromises = providerIds.map((pid) =>
              (async () => {
                try {
                  const r = await getProviderAverageRating(pid);
                  return { pid, avg: r.data };
                } catch (e) {
                  return { pid, avg: null };
                }
              })()
            );
            const ratingResults = await Promise.all(ratingPromises);
            const ratingMap = {};
            ratingResults.forEach((rr) => {
              if (rr && rr.pid) ratingMap[rr.pid] = rr.avg ?? null;
            });

            setServicesWithDistance((prev) =>
              prev.map((p) => ({ ...p, averageRating: ratingMap[p.providerId] ?? p.averageRating ?? 0 }))
            );

            // Finally compute distances for any services with coordinates but without distance
            setServicesWithDistance((prev) =>
              prev.map((p) => {
                if (p.latitude && p.longitude && customerCoords) {
                  const dist = haversineKm(customerCoords.lat, customerCoords.lon, p.latitude, p.longitude);
                  return { ...p, distance: Math.round(dist * 10) / 10 };
                }
                return p;
              })
            );
          } catch (e) {
            // non-fatal, map will show items with existing coords
            console.warn('Background geocoding failed:', e);
          }
        })();
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      const res = await updateUser(customer.id, updatedData);
      setCustomer(res.data);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  const handleCancelProfile = () => {
    setEditProfileData({ ...customer });
    setIsEditingProfile(false);
  };

  useEffect(() => {
    const openAdminChatHandler = () => {
      console.log("🟢 Event received: openAdminChat");
      setShowAdminChat(true);
    };

    window.addEventListener("openAdminChat", openAdminChatHandler);

    return () => {
      window.removeEventListener("openAdminChat", openAdminChatHandler);
    };
  }, []);

  // When the user switches to the Bookings tab, re-fetch reviews so that
  // any reviews created elsewhere (for example via the provider page) are
  // reflected immediately in the Bookings UI.
  useEffect(() => {
    const refreshReviews = async () => {
      try {
        const customerId = customer?.id ?? customer?.userId ?? customer?.customerId;
        if (!customerId) return;
        const map = {};
        const checks = await Promise.allSettled(
          bookings.map((b) => getReviewByBookingId(b.id))
        );
        checks.forEach((res, idx) => {
          if (res.status === 'fulfilled' && res.value && res.value.status === 200) {
            map[bookings[idx].id] = true;
          }
        });
        setReviewsMap(map);
      } catch (err) {
        // If anything fails here, fail silently and leave reviewsMap empty.
        setReviewsMap({});
      }
    };

    if (activeTab === 'bookings') refreshReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const sidebarItems = [
    { name: "Home", icon: <FiHome />, key: "home" },
    { name: "Browse Services", icon: <MdMiscellaneousServices />, key: "services" },
    { name: "My Bookings", icon: <BiHistory />, key: "bookings" },
    { name: "Profile", icon: <FiUser />, key: "profile" },
    { name: "Reports", icon: <FiClipboard />, key: "reports" },
  ];

  const filteredSortedServices = servicesWithDistance
    .filter((s) => {
      const matchesCategory = s.category?.toLowerCase().includes(categorySearch.toLowerCase());
      const matchesLocation = s.location?.toLowerCase().includes(locationSearch.toLowerCase());
      return matchesCategory && matchesLocation;
    })
    .sort((a, b) => {
      if (sortOption === "rating") return (b.averageRating || 0) - (a.averageRating || 0);
      if (sortOption === "distance") return (a.distance || 0) - (b.distance || 0);
      return 0;
    });

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      {/* Sidebar */}
      <aside className="w-64 p-6 flex flex-col h-screen sticky top-0" style={{ backgroundColor: rustBrown }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">FixItNow</h2>
        </div>
        <nav className="flex flex-col gap-3 flex-1">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                activeTab === item.key ? "bg-white/20 font-semibold text-white" : "hover:bg-white/10 text-white"
              }`}
            >
              {item.icon} <span>{item.name}</span>
            </button>
          ))}

          <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-lg mt-auto hover:bg-white/20 text-white border border-white/20">
            <FiLogOut /> Logout
          </button>
        </nav>
      </aside>

      {/* Notification Icon - Top Right Corner Fixed */}
      <div className="fixed top-4 right-6 z-50">
        <ChatNotifications />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
            {activeTab === "home" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold mb-4">Welcome, {customer?.name || 'Guest'} 👋 </h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard title="Total Bookings" value={bookings.length} icon={<FiClipboard style={{ color: rustBrown }} />} />
                  <MetricCard title="Available Services" value={services.length} icon={<MdMiscellaneousServices style={{ color: rustBrown }} />} />
                  <MetricCard title="Completed Bookings" value={bookings.filter((b) => b.status?.toLowerCase() === "completed").length} icon={<AiOutlineCheckCircle style={{ color: rustBrown }} />} />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-xl font-semibold mb-4" style={{ color: rustBrown }}>
                    Top Providers Near You
                  </h2>
                  <div className="flex items-center justify-end mb-4 gap-2">
                    <label className="text-sm font-medium text-gray-600">Sort by:</label>
                    <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="border px-2 py-1 rounded">
                      <option value="rating">Rating</option>
                      <option value="distance">Distance</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSortedServices.slice(0, 4).map((s) => (
                      <div key={s.id} className="flex justify-between items-center p-4 rounded-lg shadow hover:shadow-lg transition bg-gradient-to-r from-orange-50 to-white">
                        <div>
                          <p className="font-bold">{s.providerName}</p>
                          <p className="text-sm text-gray-600">{s.category}</p>
                          {s.distance && <p className="text-xs text-gray-500">{s.distance} km away</p>}
                        </div>
                        <span className="text-yellow-500 font-semibold">★ {(s.averageRating || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h2 className="text-xl font-semibold mb-4" style={{ color: rustBrown }}>
                    Recommended For You
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredSortedServices.slice(0, 3).map((s) => (
                      <ServiceCard key={s.id} service={s} setMapCenter={() => {}} setHoveredServiceId={() => {}} setSelectedService={setSelectedService} setIsBookingModalOpen={setIsBookingModalOpen} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "services" && (
              <ServicesTab
                servicesWithDistance={servicesWithDistance}
                hoveredServiceId={hoveredServiceId}
                setHoveredServiceId={setHoveredServiceId}
                categorySearch={categorySearch}
                setCategorySearch={setCategorySearch}
                locationSearch={locationSearch}
                setLocationSearch={setLocationSearch}
                setSelectedService={setSelectedService}
                setIsBookingModalOpen={setIsBookingModalOpen}
                openReviewModal={openReviewModal}
                token={token}
              />
            )}

            {activeTab === "bookings" && <BookingsTab bookings={bookings} setBookings={setBookings} reviewsMap={reviewsMap} />}

            {activeTab === "profile" && (
              <ProfileTab
                customer={customer}
                setCustomer={setCustomer}
                isEditingProfile={isEditingProfile}
                setIsEditingProfile={setIsEditingProfile}
                editProfileData={editProfileData}
                setEditProfileData={setEditProfileData}
                handleSaveProfile={handleSaveProfile}
                handleCancelProfile={handleCancelProfile}
              />
            )}

            {activeTab === "reports" && <ReportsTab user={customer} />}
          </main>
        </div>

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
        <ReviewModal service={reviewService} reviews={reviews} averageRating={averageRating} onClose={() => setIsReviewModalOpen(false)} newReview={newReview} setNewReview={setNewReview} onSubmit={handleSubmitReview} />
      )}

      {showAdminChat && (
        <div className="fixed bottom-20 right-6 sm:right-10 bg-white shadow-2xl rounded-2xl w-[29rem] max-w-[90vw] h-[36rem] border border-gray-200 p-4 flex flex-col z-50 transition-all duration-300" style={{ transform: "translateY(0)" }}>
          <button onClick={() => setShowAdminChat(false)} className="text-gray-500 hover:text-red-500 transition-colors flex justify-end">
            <FiX size={20} />
          </button>
          <div className="flex justify-center items-center w-full max-w-[90vw]">
            <ChatComponent token={token} receiverId={13} theme={"admin"} />
          </div>
        </div>
      )}

      <button onClick={() => setShowAdminChat(!showAdminChat)} className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg z-50 transition-transform hover:scale-105">
        <FiMessageCircle size={24} />
      </button>
    </div>
  );
}

// /* ----------------- COMPONENTS ----------------- */

// function MetricCard({ title, value, icon }) {
//   return (
//     <div className="bg-white border p-5 rounded-xl shadow-md flex flex-col items-center justify-center gap-2 hover:shadow-lg transition">
//       <div className="text-3xl">{icon}</div>
//       <h2 className="text-xl font-bold">{value}</h2>
//       <p className="text-sm text-gray-600">{title}</p>
//     </div>
//   );
// }

function ServicesTab({
  servicesWithDistance,
  hoveredServiceId,
  setHoveredServiceId,
  categorySearch,
  setCategorySearch,
  locationSearch,
  setLocationSearch,
  setSelectedService,
  setIsBookingModalOpen,
  // Removed unused: customer
  openReviewModal, 
  token
}) {
  const [mapCenter, setMapCenter] = useState(null);
  const [sortOption] = useState("distance"); // Removed setSortOption - not used
  const [searchRadius, setSearchRadius] = useState(); // default 5 km radius
  // Removed unused state: showChatModal, setShowChatModal
  const [showAdminChat, setShowAdminChat] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapCenter && mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [mapCenter]);



  // --- Filter services by category, location, and within radius
// --- Filter services by category, location, and radius
const filteredSortedServices = (servicesWithDistance || [])
  .filter((s) => {
    const matchesCategory = categorySearch
      ? s.category?.toLowerCase().includes(categorySearch.toLowerCase())
      : true; // show all if no category search

    const matchesLocation = locationSearch
      ? s.location?.toLowerCase().includes(locationSearch.toLowerCase())
      : true; // show all if no location search

    const withinRadius =
      searchRadius && s.distance != null
        ? s.distance <= searchRadius
        : true; // if no radius, include all

    return matchesCategory && matchesLocation && withinRadius;
  })
  .sort((a, b) => {
    if (sortOption === "rating") return (b.averageRating || 0) - (a.averageRating || 0);
    if (sortOption === "distance") return (a.distance || 0) - (b.distance || 0);
    return 0;
  });

 


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
        <div className="flex items-center gap-2">
  <label className="text-gray-700 font-medium">Within (km):</label>
  <input
    type="number"
    value={searchRadius || ""}
    onChange={(e) => setSearchRadius(Number(e.target.value))}
    className="border px-2 py-1 rounded w-20"
    min={1}
    placeholder="e.g., 5"
  />
</div>

        
        
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


// Bookings Card for CustomerDashboard
function BookingsTab({ bookings, setBookings ,reviewsMap}) {
  const navigate = useNavigate();
  // Removed unused variables: token, selectedChatProvider, setSelectedChatProvider

  const handleCustomerVerify = async (bookingId) => {
  try {
    await verifyBookingByCustomer(bookingId);

    // Update booking status
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId ? { ...b, status: "completed" } : b
      )
    );

    // Mark review as "not yet exists" explicitly
    

    alert("Booking marked as completed!");
  } catch (err) {
    console.error("Failed to verify booking:", err);
    alert("Failed to verify booking.");
  }
};

  const handleLeaveReview = (booking) => {
   navigate(`/provider/${booking.provider.id}`, {
  state: { bookingId: booking.id, serviceId: booking.service.id },
});

  };

  const getStatusBadge = (b) => {
    if (b.providerMarkedComplete && b.status?.toLowerCase() === "confirmed") {
      return (
        <span className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-semibold">
          Waiting for verification
        </span>
      );
    }

    switch (b.status?.toLowerCase()) {
      case "completed":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-semibold">
            <AiOutlineCheckCircle /> {b.status}
          </span>
        );
        case "confirmed":
      return (
        <span className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-semibold">
          <FiClock /> {b.status}
        </span>
      );
      case "pending":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-semibold">
            <FiClock /> {b.status}
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-semibold">
            <FiXCircle /> {b.status}
          </span>
        );
      default:
        return <span className="px-2 py-1 bg-gray-100 rounded-full">{b.status}</span>;
    }
  };

  if (!bookings || bookings.length === 0) {
    return <p className="text-black/70 mt-4">No bookings available.</p>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: "#6e290c" }}>
        <BiClipboard /> My Bookings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map(b => (
          <div
            key={b.id}
            className="bg-white border-l-4 rounded-xl p-5 shadow hover:shadow-lg transition flex flex-col gap-3"
            style={{
  borderColor:
    b.status?.toLowerCase() === "pending"
      ? "#facc15"
      : b.status?.toLowerCase() === "completed"
      ? "#16a34a"
      : b.status?.toLowerCase() === "confirmed"
      ? "#3b82f6" // blue for confirmed
      : "#dc2626",
}}

          >
            <div className="flex col items-center gap-3">
              <FiUser />
              <h3 className="font-semibold text-lg">{b.provider?.name || "Unknown"}</h3>
              {getStatusBadge(b)}
            </div>

            <p className="text-sm text-gray-700">
              <span className="font-semibold">{b.service?.category}</span> - {b.service?.subcategory}
            </p>
            <p className="text-sm text-gray-600">{b.service?.description}</p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Date:</span> {b.bookingDate} | <span className="font-semibold">Time:</span> {b.timeSlot}
            </p>

            {b.providerMarkedComplete && b.status?.toLowerCase() === "confirmed" && (
              <button
                onClick={() => handleCustomerVerify(b.id)}
                className="px-6 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700"
              >
                Verify & Complete
              </button>
            )}
            {b.status?.toLowerCase() !== "cancelled" && (
  <button
  onClick={() =>
    navigate(`/chat/${b.provider.id}`, { state: { provider: b.provider } })
  }
  className="px-4 py-2 bg-[#6e290c] text-white rounded-lg hover:bg-[#a44a1d] transition"
>
  Chat
</button>

            )}

           {b.status?.toLowerCase() === "completed" && !reviewsMap[b.id] && (
  <button
    onClick={() => handleLeaveReview(b)}
    className="px-4 py-2 bg-[#6e290c] text-white rounded-lg hover:bg-[#a44a1d] transition"
  >
    Leave a Review
  </button>
)}







          </div>
        ))}
      </div>
    </div>
  );
}





function ProfileTab({
  customer,
  setCustomer,
  isEditingProfile,
  setIsEditingProfile,
  editProfileData,
  setEditProfileData,
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSaveProfile = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Merge existing customer data with edited fields
      const updatedProfile = { ...customer, ...editProfileData };
      const res = await updateUser(customer.id, updatedProfile);

      // Update parent state and reset edit form
      setCustomer(res.data);
      setEditProfileData({ ...res.data });
      setIsEditingProfile(false);

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setErrorMsg(
        err.response?.data?.message || "Failed to save profile. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelProfile = () => {
    // Revert form to original customer data
    setEditProfileData({ ...customer });
    setIsEditingProfile(false);
    setErrorMsg("");
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow w-full max-w-md relative">
      <h2 className="text-xl font-semibold mb-4" style={{ color: "#6e290c" }}>
        My Profile
      </h2>

      {errorMsg && <p className="text-red-600 mb-2">{errorMsg}</p>}

      <div className="flex flex-col gap-2">
        {isEditingProfile ? (
          <>
            <input
              type="text"
              value={editProfileData.name || ""}
              onChange={(e) =>
                setEditProfileData({ ...editProfileData, name: e.target.value })
              }
              className="border px-3 py-2 rounded"
              placeholder="Name"
            />
            <input
              type="email"
              value={editProfileData.email || ""}
              onChange={(e) =>
                setEditProfileData({ ...editProfileData, email: e.target.value })
              }
              className="border px-3 py-2 rounded"
              placeholder="Email"
            />
            <input
              type="text"
              value={editProfileData.location || ""}
              onChange={(e) =>
                setEditProfileData({ ...editProfileData, location: e.target.value })
              }
              className="border px-3 py-2 rounded"
              placeholder="Location"
            />

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSaveProfile}
                className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
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
            <p>
              <strong>Name:</strong> {customer.name}
            </p>
            <p>
              <strong>Email:</strong> {customer.email}
            </p>
            <p>
              <strong>Location:</strong> {customer.location || "N/A"}
            </p>
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