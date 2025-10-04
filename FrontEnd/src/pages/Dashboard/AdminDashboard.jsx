import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome, FiUsers, FiLogOut, FiClock, FiXCircle,
} from "react-icons/fi";
import { BiClipboard, BiUserCircle } from "react-icons/bi";
import { MdAdminPanelSettings } from "react-icons/md";
import { FaUserCheck, FaUserTie } from "react-icons/fa";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { GiElectric, GiHammerNails, GiBroom } from "react-icons/gi";
import {
  getAllUsers, deleteUser, updateUser, getAllServices,
  updateService, deleteService
} from "../../services/api";

const rustBrown = "#6e290cff";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  // Fetch Users
  useEffect(() => {
    async function fetchUsers() {
      setLoadingUsers(true);
      try {
        const res = await getAllUsers();
        setUsers(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch users");
      } finally {
        setLoadingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  // Fetch Services
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await getAllServices();
        setServices(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch services");
      }
    }
    fetchServices();
  }, []);

  // Fetch Bookings (dummy)
  useEffect(() => {
    setLoadingBookings(true);
    setTimeout(() => {
      setBookings([
        { id: 1001, user: "John Smith", service: "Plumbing", status: "Completed" },
        { id: 1002, user: "Jane Doe", service: "Electrical", status: "Pending" },
      ]);
      setLoadingBookings(false);
    }, 500);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const sidebarItems = [
    { name: "Home", icon: <FiHome className="text-white" />, key: "home" },
    { name: "Users", icon: <BiUserCircle className="text-white" />, key: "users" },
    { name: "Services", icon: <MdAdminPanelSettings className="text-white" />, key: "services" },
  ];

  return (
    <div className="flex min-h-screen bg-white text-black">
      {/* Sidebar */}
      <aside className="w-64 p-6 flex flex-col" style={{ backgroundColor: rustBrown }}>
        <h2 className="text-2xl font-bold mb-6 text-white">FixItNow Admin</h2>
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <MetricCard title="Total Users" value={users.length} icon={<FiUsers style={{ color: rustBrown }} />} />
              <MetricCard title="Total Bookings" value={bookings.length} icon={<BiClipboard style={{ color: rustBrown }} />} />
              <MetricCard title="Verified Providers" value={users.filter(u => u.role.toLowerCase() === "provider").length} icon={<FaUserCheck style={{ color: rustBrown }} />} />
              <MetricCard title="Pending Approvals" value={3} icon={<MdAdminPanelSettings style={{ color: rustBrown }} />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UsersCardHome users={users} loading={loadingUsers} />
              <BookingsCard bookings={bookings} loading={loadingBookings} />
            </div>
          </>
        )}

        {activeTab === "users" && (
          <UsersCardFull users={users} loading={loadingUsers} setUsers={setUsers} />
        )}

        {activeTab === "services" && (
          <ServicesCardFull services={services} setServices={setServices} />
        )}
      </main>
    </div>
  );
}

// Metric Card
function MetricCard({ title, value, icon }) {
  return (
    <div className="bg-white border p-5 rounded-xl shadow-md flex flex-col items-center justify-center gap-3" style={{ borderColor: rustBrown + "40" }}>
      <div className="text-3xl">{icon}</div>
      <h2 className="text-2xl font-bold">{value}</h2>
      <p className="text-sm text-black/70">{title}</p>
    </div>
  );
}

// Users Home
function UsersCardHome({ users, loading }) {
  if (loading) return <div className="bg-white border rounded-lg p-4 text-center" style={{ borderColor: rustBrown + "40" }}>Loading users...</div>;
  return (
    <div className="bg-white border rounded-xl p-6" style={{ borderColor: rustBrown + "40" }}>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: rustBrown }}><FiUsers /> Users</h2>
      <div className="divide-y divide-black/10">
        {users.map(u => (
          <div key={u.id} className="flex justify-between items-center py-3 px-2 hover:bg-[rgba(183,65,14,0.1)] rounded-lg transition">
            <div>
              <h3 className="text-lg font-bold">{u.name}</h3>
              <p className="text-sm text-black/70">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {u.role.toLowerCase() === "admin" && <MdAdminPanelSettings className="w-5 h-5" style={{ color: rustBrown }} />}
              {u.role.toLowerCase() === "provider" && <FaUserTie className="w-5 h-5" style={{ color: rustBrown }} />}
              {u.role.toLowerCase() === "customer" && <FiUsers className="w-5 h-5" style={{ color: rustBrown }} />}
              <span className="px-3 py-1 text-sm border rounded-full" style={{ borderColor: rustBrown + "40" }}>{u.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Full Users
function UsersCardFull({ users, loading, setUsers }) {
  if (loading) return <div className="bg-white border rounded-lg p-6 text-center" style={{ borderColor: rustBrown + "40" }}>Loading users...</div>;

  return (
    <div className="bg-white border rounded-xl p-6 w-full" style={{ borderColor: rustBrown + "40" }}>
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3" style={{ color: rustBrown }}><FiUsers /> Manage Users</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
          <UserCard key={u.id} user={u} setUsers={setUsers} users={users} />
        ))}
      </div>
    </div>
  );
}

// User Card Component
function UserCard({ user, users, setUsers }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...user });

  const handleSave = async () => {
    try {
      await updateUser(user.id, editData);
      setUsers(users.map(u => u.id === user.id ? editData : u));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update user.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(user.id);
      setUsers(users.filter(u => u.id !== user.id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  return (
    <div className="flex flex-col justify-between bg-white border p-5 rounded-xl hover:shadow-md transition" style={{ borderColor: rustBrown + "40" }}>
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className="border px-2 py-1 rounded" placeholder="Name" />
          <input value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} className="border px-2 py-1 rounded" placeholder="Email" />
          <select value={editData.role} onChange={e => setEditData({ ...editData, role: e.target.value })} className="border px-2 py-1 rounded">
            <option value="ADMIN">ADMIN</option>
            <option value="PROVIDER">PROVIDER</option>
            <option value="CUSTOMER">CUSTOMER</option>
          </select>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-bold">{user.name}</h3>
          <p className="text-sm text-black/70">{user.email}</p>
          <span className="text-sm px-2 py-1 border rounded-full" style={{ borderColor: rustBrown + "40" }}>{user.role}</span>
        </div>
      )}
      <div className="mt-4 flex justify-end gap-2">
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
  );
}

// Services Card
function ServicesCardFull({ services, setServices }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map(service => (
        <ServiceCard key={service.id} service={service} setServices={setServices} services={services} />
      ))}
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
    try {
      await updateService(service.id, editData);
      setServices(services.map(s => s.id === service.id ? editData : s));
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
    <div className="flex flex-col justify-between bg-white border p-5 rounded-xl hover:shadow-md transition" style={{ borderColor: rustBrown + "40" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl">{icon}</div>
        <h3 className="font-bold text-lg">{service.category} - {service.subcategory}</h3>
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2 mb-4">
          <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} className="border px-2 py-1 rounded" placeholder="Description" />
          <input type="number" value={editData.price} onChange={e => setEditData({ ...editData, price: parseFloat(e.target.value) })} className="border px-2 py-1 rounded" placeholder="Price" />
          <input type="text" value={editData.availability} onChange={e => setEditData({ ...editData, availability: e.target.value })} className="border px-2 py-1 rounded" placeholder="Availability" />
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

// Bookings
function BookingsCard({ bookings, loading }) {
  if (loading) return <div className="bg-white border rounded-lg p-4" style={{ borderColor: rustBrown + "40" }}>Loading bookings...</div>;

  const getStatusBadge = status => {
    switch(status.toLowerCase()) {
      case "completed": return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full"><AiOutlineCheckCircle /> {status}</span>;
      case "pending": return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full"><FiClock /> {status}</span>;
      case "cancelled": return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full"><FiXCircle /> {status}</span>;
      default:
        return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-black text-white rounded-full">{status}</span>;
    }
  };

  return (
    <div className="bg-white border rounded-xl p-6" style={{ borderColor: rustBrown + "40" }}>
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2" style={{ color: rustBrown }}>
        <BiClipboard /> Recent Bookings
      </h2>
      <div className="divide-y divide-black/10">
        {bookings.map((b) => (
          <div key={b.id} className="flex justify-between py-3 px-2 hover:bg-[rgba(183,65,14,0.1)] rounded-lg transition">
            <div>
              <p className="font-medium">{b.user}</p>
              <p className="text-sm text-black/70">{b.service}</p>
            </div>
            <div>{getStatusBadge(b.status)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
