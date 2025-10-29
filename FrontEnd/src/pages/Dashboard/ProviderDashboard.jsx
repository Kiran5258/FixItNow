import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiLogOut, FiClock, FiXCircle, FiUser,FiMessageCircle,FiX,FiMessageSquare } from "react-icons/fi";
import { BiClipboard } from "react-icons/bi";
import { GiHammerNails } from "react-icons/gi";
import { AiOutlineCheckCircle, AiOutlineRadiusSetting } from "react-icons/ai";
import { FaRegLightbulb } from "react-icons/fa";
import ChatComponent from "../../components/ChatComponent";
import ChatNotifications from "../../components/ChatNotifications";
// Removed unused import: useAuth




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
  deleteReview,
  markBookingCompleteByProvider,
  getAllUsers
  
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
  // Removed unused state: showChatModal, setShowChatModal
  const [showAdminChat, setShowAdminChat] = useState(false); // for floating chat


const [customers, setCustomers] = useState([]);
const [selectedCustomer, setSelectedCustomer] = useState(null);
const [token] = useState(localStorage.getItem("token")); // Removed setToken - not used




  

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
  const handleOpenAdminChat = () => {
    setShowAdminChat(true);
  };

  window.addEventListener("openAdminChat", handleOpenAdminChat);
  return () => window.removeEventListener("openAdminChat", handleOpenAdminChat);
}, []);




  useEffect(() => {
  const savedTab = localStorage.getItem("activeTab");

  // If we stored tab as a number like "2" or a key like "users"
  if (savedTab) {
    // If numeric, map to your sidebar order
    if (!isNaN(savedTab)) {
      const tabs = ["home", "myservices", "bookings","profiles","reviews", "chat"];
      const index = parseInt(savedTab, 10) - 1;
      if (tabs[index]) setActiveTab(tabs[index]);
    } else {
      // If a string key (like "chat" or "users")
      setActiveTab(savedTab);
    }
    localStorage.removeItem("activeTab"); // clear it after use
  }
}, []);
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

  useEffect(() => {
  const fetchCustomers = async () => {
    try {
      const response = await getAllUsers(); // admin endpoint that returns all users
      // Filter only customers
      const customerList = response.data.filter(user => user.role === "CUSTOMER");
      setCustomers(customerList);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };
  fetchCustomers();
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
    setEditProfileData({ ...provider }); // Fixed: use 'provider' instead of 'customer'
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
    onClick={() => setActiveTab("chat")}
    className={`flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 text-white transition ${
      activeTab === "chat" ? "bg-[#6e290c]" : ""
    }`}
  >
    <FiMessageSquare /> Chat
  </button>

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
        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
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
{activeTab === "chat" && (
  <div className="flex flex-col md:flex-row h-[90vh] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
    {/* Left: Customer List */}
    <div className="w-full md:w-1/3 bg-[#f7f3f1] border-r border-gray-300 p-4">
      <h3 className="text-lg font-semibold text-[#6e290c] mb-4">Active Chats</h3>
      <div className="space-y-2 overflow-y-auto h-[65vh]">
        {customers.length > 0 ? (
          customers.map((cust) => (
            <button
              key={cust.id}
              onClick={() => setSelectedCustomer(cust)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                selectedCustomer?.id === cust.id
                  ? "bg-[#6e290c] text-white font-semibold"
                  : "hover:bg-[#ecdcd4] text-gray-800"
              }`}
            >
              {cust.name}
            </button>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center mt-8">No active customers</p>
        )}
      </div>
    </div>

    {/* Right: Chat Window */}
    <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 p-4">
      {selectedCustomer ? (
        
        <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-xl shadow-sm p-4 h-[100vh] flex flex-col ">
          
          <button
              onClick={() => setSelectedCustomer(null)}
              className="text-gray-400 hover:text-red-500 transition text-right mt-2 "
            >
              ✕
            </button>
          

          <ChatComponent
            token={token}
            receiverId={selectedCustomer.id}
            width="100%"
            height="100%"
            theme="provider"
          />
        </div>
      ) : (
        <div className="text-gray-500 text-center">
          <FiMessageSquare className="mx-auto mb-3 text-4xl text-gray-400" />
          <p>Select a customer to start chatting</p>
        </div>
      )}
    </div>
  </div>
)}

      </main>
      {/* Floating Admin Chat Button and Modal – stays visible always */}
{showAdminChat && (
  <div
    className="fixed bottom-20 right-6 sm:right-10 bg-white shadow-2xl rounded-2xl w-[29rem] max-w-[90vw] h-[36rem] border border-gray-200 p-4 flex flex-col z-50 transition-all duration-300"
    style={{ transform: "translateY(0)" }}
  >
    <button
        onClick={() => setShowAdminChat(false)}
        className="text-gray-500 hover:text-red-500 transition-colors flex justify-end"
      >
        <FiX size={20} />
      </button>
    <div className="flex justify-center items-center w-full max-w-[90vw]">
    <ChatComponent token={token} receiverId={13} theme={"admin"} />
  </div>
    
</div>
)}

{/* Floating Chat Button */}
{/* Floating Admin Chat Button */}
<button
  onClick={() => setShowAdminChat(!showAdminChat)}
  className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg z-50 transition-transform hover:scale-105"
>
  <FiMessageCircle size={24} />
</button>


      </div>
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

  const handleDeleteService = async (serviceId) => {
  if (!window.confirm("Are you sure you want to delete this service?")) return;

  try {
    await deleteService(serviceId); // Call backend API
    setServices(prev => prev.filter(s => s.id !== serviceId)); // Remove from state
    alert("Service deleted successfully!");
  } catch (err) {
    console.error("Failed to delete service:", err);
    alert("Failed to delete service. Please try again.");
  }
};
  const handleSave = async () => {
    if (!newService.category || !newService.subcategory || !newService.description || !newService.price || !newService.availability || !newService.location) {
      alert("Please fill all fields including availability and location");
      return;
    }

    // Delete Service Handler



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
              <button
  onClick={() => handleDeleteService(service.id)}
  className="bg-[#B7410E] text-white px-3 py-1 rounded"
>
  Delete
</button>

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
              <button
  onClick={() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        setNewService((prev) => ({
          ...prev,
          location: data.display_name || `Lat: ${latitude}, Lon: ${longitude}`,
        }));
      });
    } else {
      alert("Geolocation not supported");
    }
  }}
  className="px-2 py-2 rounded-md text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-transform transform hover:scale-105"
>
  Use Current
</button>
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
      case "confirmed":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-semibold">
            {status}
          </span>
        );
      default:
        return <span className="px-2 py-1 bg-gray-100 rounded-full">{status}</span>;
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));
    } catch (err) {
      console.error(err);
      alert("Failed to update booking status.");
    }
  };

  const handleMarkComplete = async (bookingId) => {
  try {
    await markBookingCompleteByProvider(bookingId); // backend can just set providerMarkedComplete = true
    setBookings(bookings.map(b =>
      b.id === bookingId ? { ...b, providerMarkedComplete: true } : b
    ));
    alert("Marked as completed. Waiting for customer verification.");
  } catch (err) {
    console.error(err);
    alert("Failed to mark booking as complete.");
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
        {bookings.map((b) => {
          const now = new Date();

  // Extract start time from timeSlot
  const startTime = b.timeSlot.split(" - ")[0]; // "9:00 AM"

  // Combine date + start time to get booking Date object
 const bookingDateTime = new Date(`${b.bookingDate} ${startTime}`);


  // Check if "Mark as Complete" button should show
  const showMarkCompleteBtn =
    b.status?.toLowerCase() === "confirmed" &&
    !b.providerMarkedComplete &&
    bookingDateTime <= now;

console.log("Booking ID:", b.id, "BookingDateTime:", bookingDateTime, "Now:", now, "ShowBtn:", showMarkCompleteBtn,b.bookingDate,b.timeSlot);



          return (
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
                    ? "#3b82f6"
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

              {/* Pending Booking Buttons */}
              {b.status?.toLowerCase() === "pending" && (
                <div className="flex gap-2 mt-2">
                  <button
                    className="flex-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition"
                    onClick={() => handleStatusUpdate(b.id, "CONFIRMED")}
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

              {/* Confirmed Booking => Mark as Completed */}
              {showMarkCompleteBtn && (
                <button
                  className="px-4 py-2 bg-[#6e290c] text-white rounded-lg hover:bg-[#a44a1d] transition"
                  onClick={() => handleMarkComplete(b.id)}
                >
                  Mark as Completed
                </button>
              )}

              {/* Waiting for customer verification */}
              {/* Show status */}
{/* Waiting for customer verification */}
{b.status?.toLowerCase() === "confirmed" && b.providerMarkedComplete && (
  <span className="flex-1 text-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg mt-2">
    Waiting for customer verification
  </span>
)}



            </div>
          );
        })}
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
  // Removed unused variables: replyText, setReplyText, selectedReview, setSelectedReview, loading, setLoading, handleReply

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
              {r.service?.category && (
  <span className="px-2 py-1 bg-gray-200 rounded">
    {`Category: ${r.service.category}`}
  </span>
)}

{r.service?.subcategory && (
  <span className="px-2 py-1 bg-gray-200 rounded">
    {`Subcategory: ${r.service.subcategory}`}
  </span>
)}

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