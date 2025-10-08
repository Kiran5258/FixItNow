import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiLogOut, FiClock, FiXCircle } from "react-icons/fi";
import { BiClipboard } from "react-icons/bi";
import { GiElectric, GiHammerNails, GiBroom } from "react-icons/gi";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { FaRegLightbulb } from "react-icons/fa";
import {
  getMyProfile,
  getServicesByProvider,
  updateService,
  deleteService,
  createService,
} from "../../services/api";

const rustBrown = "#6e290cff";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [error, setError] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: providerData } = await getMyProfile();
        setProvider(providerData);

        const servicesRes = await getServicesByProvider(providerData.id);
        setServices(servicesRes.data || []);
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

  const sidebarItems = [
    { name: "Home", icon: <FiHome className="text-white" />, key: "home" },
    { name: "My Services", icon: <GiHammerNails className="text-white" />, key: "services" },
    { name: "Bookings", icon: <BiClipboard className="text-white" />, key: "bookings" },
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard title="My Services" value={services.length} icon={<GiHammerNails style={{ color: rustBrown }} />} />
              <MetricCard title="Total Bookings" value={bookings.length} icon={<BiClipboard style={{ color: rustBrown }} />} />
              <MetricCard
                title="Completed Bookings"
                value={bookings.filter(b => b.status?.toLowerCase() === "completed").length}
                icon={<AiOutlineCheckCircle style={{ color: rustBrown }} />}
              />
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
          <BookingsCard bookings={bookings} />
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
    hours < 18 ? "Good Afternoon" : "Good Evening";

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

// Services with Modal 2
// Services with Modal 2
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
            <p className="text-sm mt-2">{service.description}</p><br></br>
            <b><p className="text-sm text-black/60">Availability: {service.availability}</p> {/* Display Availability */}
            </b><br></br>
            <p className="text-sm text-black/60">Location: {service.location}</p>
            <p className="font-semibold text-lg mt-2">₹{service.price}</p>
            
            <div className="ml-30 flex gap-3">
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

      {/* Modal */}
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
              onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
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
function ServicePerformance({ services, bookings }) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Service Performance</h2>
      <div className="flex flex-col gap-3">
        {services.map(service => {
          const completedBookings = bookings.filter(b => b.serviceId === service.id && b.status?.toLowerCase() === "completed").length;
          const totalBookings = bookings.filter(b => b.serviceId === service.id).length;
          const progress = totalBookings ? (completedBookings / totalBookings) * 100 : 0;

          return (
            <div key={service.id} className="bg-white p-3 rounded shadow flex flex-col gap-1">
              <div className="flex justify-between">
                <span>{service.category} - {service.subcategory}</span>
                <span>{completedBookings}/{totalBookings} completed</span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
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
            <span>{b.customerName || b.user} booked {b.service}</span>
            <span className="text-sm text-gray-500">{b.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bookings Card
function BookingsCard({ bookings }) {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
            <AiOutlineCheckCircle /> {status}
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
            <FiClock /> {status}
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
            <FiXCircle /> {status}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: rustBrown }}>
        <BiClipboard /> My Bookings
      </h2>

      {(!bookings || bookings.length === 0) ? (
        <p className="text-black/70">No bookings available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white border rounded-xl p-5 shadow hover:shadow-lg transition flex flex-col gap-2" style={{ borderColor: rustBrown + "40" }}>
              <div className="flex items-center gap-3">
                <BiClipboard className="text-2xl" style={{ color: rustBrown }} />
                <h3 className="font-semibold text-lg">{b.customerName || b.user}</h3>
              </div>
              <p className="text-sm text-black/70">{b.service}</p>
              <div className="mt-2">{getStatusBadge(b.status)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
