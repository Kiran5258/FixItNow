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
  getUserById,
  
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
const allServices = Array.isArray(sRes.data) ? sRes.data : [];


const verifiedServices = allServices.filter(s => s.providerVerified);
setServices(verifiedServices);

// Initialize with available coordinates for faster UI rendering
setServicesWithDistance(
  verifiedServices.map((s) => ({
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

            const updated = [...verifiedServices];
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

/* ----------------- NOTES ----------------- */
// This file was reconstructed to fix syntax errors introduced during a large refactor.
// It intentionally keeps logic minimal: moved UI parts into their component files under
// src/pages/Dashboard/components/Customer/. The split components should provide the
// detailed behavior. If you want, I can continue to reintroduce more advanced fetching
// (distance calculations) and client-side caching next.