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
          <ServicesCardFull services={services} setServices={setServices} />
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

// Services Card Full
function ServicesCardFull({ services, setServices }) {
  const [adding, setAdding] = useState(false);
  const [newService, setNewService] = useState({
    category: "",
    subcategory: "",
    description: "",
    price: 0,
    availability: "",
  });

  const handleAddService = async () => {
    if (!newService.category || !newService.subcategory || !newService.description || !newService.price || !newService.availability) {
      alert("Please fill all fields");
      return;
    }
    try {
      const res = await createService(newService);
      setServices([...services, res.data]);
      setAdding(false);
      setNewService({ category: "", subcategory: "", description: "", price: 0, availability: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add service.");
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => setAdding(!adding)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition mb-4"
      >
        {adding ? "Cancel" : "Add Service"}
      </button>

      {adding && (
        <div className="bg-white border rounded-xl p-5 mb-6 shadow-md flex flex-col gap-3" style={{ borderColor: rustBrown + "40" }}>
          {/* Category */}
          <select
            value={newService.category}
            onChange={(e) => setNewService({ ...newService, category: e.target.value, subcategory: "" })}
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Category</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Cleaning">Cleaning</option>
          </select>

          {/* Subcategory */}
          <select
            value={newService.subcategory}
            onChange={(e) => setNewService({ ...newService, subcategory: e.target.value })}
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Subcategory</option>
            {newService.category === "Plumbing" && (
              <>
                <option value="Pipe Repair">Pipe Repair</option>
                <option value="Faucet Installation">Faucet Installation</option>
              </>
            )}
            {newService.category === "Electrical" && (
              <>
                <option value="Wiring">Wiring</option>
                <option value="Appliance Repair">Appliance Repair</option>
              </>
            )}
            {newService.category === "Carpentry" && <option value="Furniture Repair">Furniture Repair</option>}
            {newService.category === "Cleaning" && <option value="Home Cleaning">Home Cleaning</option>}
          </select>

          <textarea
            value={newService.description}
            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
            placeholder="Describe your services"
            className="w-full px-4 py-3 rounded-md border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
          />

          <input
            type="number"
            placeholder="Service Price"
            value={newService.price}
            onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="text"
            placeholder="Availability (e.g., Mon-Fri 9:00-18:00)"
            value={newService.availability}
            onChange={(e) => setNewService({ ...newService, availability: e.target.value })}
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={handleAddService}
            className="px-2 py-2 rounded-md text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-transform transform hover:scale-105"
          >
            Save Service
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(service => (
          <ServiceCard key={service.id} service={service} services={services} setServices={setServices} />
        ))}
      </div>
    </div>
  );
}

// Service Card Component
function ServiceCard({ service, services, setServices }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...service });

  const icon =
    service.category.toLowerCase() === "carpentry" ? <GiHammerNails style={{ color: rustBrown }} /> :
    service.category.toLowerCase() === "electrical" ? <GiElectric style={{ color: rustBrown }} /> :
    service.category.toLowerCase() === "cleaning" ? <GiBroom style={{ color: rustBrown }} /> :
    <GiHammerNails style={{ color: rustBrown }} />;

  const handleSave = async () => {
    if (!editData.category || !editData.subcategory || !editData.description || !editData.price || !editData.availability) {
      alert("Please fill all fields");
      return;
    }
    try {
      await updateService(service.id, editData);
      setServices(services.map(s => (s.id === service.id ? editData : s)));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update service.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteService(service.id);
      setServices(services.filter(s => s.id !== service.id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete service.");
    }
  };

  return (
    <div className="flex flex-col justify-between bg-white border p-5 rounded-xl hover:shadow-lg transition" style={{ borderColor: rustBrown + "40" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl">{icon}</div>
        <h3 className="font-bold text-lg">
          {service.category} - {service.subcategory}
        </h3>
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2 mb-4">
          <select
            value={editData.category}
            onChange={(e) => setEditData({ ...editData, category: e.target.value, subcategory: "" })}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Category</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Cleaning">Cleaning</option>
          </select>

          <select
            value={editData.subcategory}
            onChange={(e) => setEditData({ ...editData, subcategory: e.target.value })}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Subcategory</option>
            {editData.category === "Plumbing" && (
              <>
                <option value="Pipe Repair">Pipe Repair</option>
                <option value="Faucet Installation">Faucet Installation</option>
              </>
            )}
            {editData.category === "Electrical" && (
              <>
                <option value="Wiring">Wiring</option>
                <option value="Appliance Repair">Appliance Repair</option>
              </>
            )}
            {editData.category === "Carpentry" && <option value="Furniture Repair">Furniture Repair</option>}
            {editData.category === "Cleaning" && <option value="Home Cleaning">Home Cleaning</option>}
          </select>

          <textarea
            value={editData.description}
            onChange={e => setEditData({ ...editData, description: e.target.value })}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={3}
          />

          <input
            type="number"
            value={editData.price}
            onChange={e => setEditData({ ...editData, price: parseFloat(e.target.value) })}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="text"
            value={editData.availability}
            onChange={e => setEditData({ ...editData, availability: e.target.value })}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      ) : (
        <p className="text-sm text-black/70 mb-4">{service.description}</p>
      )}

      <div className="flex justify-between items-center">
        {!isEditing && <span className="font-semibold text-black text-lg">₹{service.price}</span>}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">Save</button>
              <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="bg-[#4B5563] text-white px-3 py-1 rounded hover:bg-[#374151] transition">Edit</button>
              <button onClick={handleDelete} className="bg-[#B7410E] text-white px-3 py-1 rounded hover:bg-[#8a300b] transition">Delete</button>
            </>
          )}
        </div>
      </div>
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
