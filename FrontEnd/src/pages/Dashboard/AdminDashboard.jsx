import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiHome, FiUsers, FiLogOut, FiClock, FiXCircle,FiCheckCircle,
} from "react-icons/fi";
import { BiClipboard, BiUserCircle } from "react-icons/bi";
import { MdAdminPanelSettings } from "react-icons/md";
import { FaUserCheck, FaUserTie ,FaExclamationTriangle} from "react-icons/fa";
import { AiOutlineCheckCircle, } from "react-icons/ai";
import { GiElectric, GiHammerNails, GiBroom } from "react-icons/gi";
import { CheckCircleIcon, TrashIcon } from "@heroicons/react/24/solid";
import {
  getAllUsers, deleteUser, updateUser, getAllServices,
  updateService, deleteService, getAllBookings,getAllDocuments, approveDocument, deleteDocument,
} from "../../services/api";
import ChatComponent from "../../components/ChatComponent";
import ChatNotifications from "../../components/ChatNotifications";
import DisputeManagement from "../admin/DisputeManagement";

const rustBrown = "#6e290cff";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  // Restore active tab when navigating from notifications
useEffect(() => {
  const savedTab = localStorage.getItem("activeTab");

  if (savedTab) {
    // Define admin tab order — match sidebar keys
    const tabs = ["home", "users", "services", "chat"];

    // If numeric (e.g., "2"), map to sidebar order
    if (!isNaN(savedTab)) {
      const index = parseInt(savedTab, 10) - 1;
      if (tabs[index]) {
        setActiveTab(tabs[index]);
        console.log(`🔁 Restored tab: ${tabs[index]} (from index ${index + 1})`);
      }
    } else {
      // If it's a string key like "chat" or "users"
      setActiveTab(savedTab);
      console.log(`🔁 Restored tab by name: ${savedTab}`);
    }

    localStorage.removeItem("activeTab"); // Clear after using
  }
}, []);


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

  // Fetch Bookings from backend
  useEffect(() => {
    async function fetchBookings() {
      setLoadingBookings(true);
      try {
        const res = await getAllBookings();
        // Sort latest first
        const sorted = res.data.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
        setBookings(sorted);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch bookings");
      } finally {
        setLoadingBookings(false);
      }
    }
    fetchBookings();
  }, []);

  

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const sidebarItems = [
    { name: "Home", icon: <FiHome className="text-white" />, key: "home" },
    { name: "Users", icon: <BiUserCircle className="text-white" />, key: "users" },
    { name: "Services", icon: <MdAdminPanelSettings className="text-white" />, key: "services" },
    { name: "Chat", icon: <FiUsers className="text-white" />, key: "chat" },
    { name: "Verify Providers", icon: <FiCheckCircle className="text-white" />, key: "verify" },
{ name: "Dispute Management", icon: <FaExclamationTriangle />, key: "disputes" }



  ];

  return (
    <div className="flex min-h-screen bg-white text-black">
      {/* Sidebar */}
      <aside className="w-64 p-6 flex flex-col h-screen sticky top-0" style={{ backgroundColor: rustBrown }}>
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

      {/* Notification Icon - Top Right Corner Fixed */}
      <div className="fixed top-4 right-6 z-50">
        <ChatNotifications />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === "home" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <MetricCard title="Total Users" value={users.length} icon={<FiUsers style={{ color: rustBrown }} />} />
              <MetricCard title="Total Bookings" value={bookings.length} icon={<BiClipboard style={{ color: rustBrown }} />} />
              <MetricCard title="Verified Providers" value={users.filter(u => (u.role || "").toLowerCase() === "provider").length} icon={<FaUserCheck style={{ color: rustBrown }} />} />
              <MetricCard title="Pending Approvals" value={3} icon={<MdAdminPanelSettings style={{ color: rustBrown }} />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UsersCardHome users={users} loading={loadingUsers} />
              <BookingsCard bookings={bookings.slice(0, 5)} loading={loadingBookings} />
            </div>
          </>
        )}

        {activeTab === "users" && (
          <UsersCardFull users={users} loading={loadingUsers} setUsers={setUsers} />
        )}

        {activeTab === "services" && (
          <ServicesCardFull services={services} setServices={setServices} />
        )}

        {activeTab === "chat" && (
  <AdminChatSection users={users} />
)}

{activeTab === "verify" && <VerifyDocumentsTab />}
{activeTab === "disputes" && <DisputeManagement />}


      </main>
      </div>
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
              {(u.role || "").toLowerCase() === "admin" && <MdAdminPanelSettings className="w-5 h-5" style={{ color: rustBrown }} />}
              {(u.role || "").toLowerCase() === "provider" && <FaUserTie className="w-5 h-5" style={{ color: rustBrown }} />}
              {(u.role || "").toLowerCase() === "customer" && <FiUsers className="w-5 h-5" style={{ color: rustBrown }} />}
              <span className="px-3 py-1 text-sm border rounded-full" style={{ borderColor: rustBrown + "40" }}>{u.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bookings Card
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
              <p className="font-medium">{b.customer?.name}</p>
              <p className="text-sm text-black/70">{b.service?.category} - {b.service?.subcategory}</p>
            </div>
            <div>{getStatusBadge(b.status)}
              <h> ₹{b.service?.price}</h>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}


// Users Full
function UsersCardFull({ users, loading, setUsers }) {
  if (loading)
    return (
      <div
        className="bg-white border rounded-lg p-6 text-center shadow-md"
        style={{ borderColor: rustBrown + "40" }}
      >
        Loading users...
      </div>
    );

  return (
    <div
      className="bg-white border rounded-xl p-6 w-full shadow-md"
      style={{ borderColor: rustBrown + "40" }}
    >
      <h2
        className="text-2xl font-semibold mb-6 flex items-center gap-3"
        style={{ color: rustBrown }}
      >
        <FiUsers /> Manage Users
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <UserCard key={u.id} user={u} setUsers={setUsers} users={users} />
        ))}
      </div>
    </div>
  );
}

// User Card with Modal Popup
function UserCard({ user, users, setUsers }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...user });

  const roleIcon =
    (user.role || "").toLowerCase() === "admin" ? (
      <MdAdminPanelSettings className="w-6 h-6 text-white" />
    ) : (user.role || "").toLowerCase() === "provider" ? (
      <FaUserTie className="w-6 h-6 text-white" />
    ) : (
      <FiUsers className="w-6 h-6 text-white" />
    );

  const handleSave = async () => {
    try {
      await updateUser(user.id, editData);
      setUsers(users.map((u) => (u.id === user.id ? editData : u)));
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
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between bg-gradient-to-r from-white to-[#fff7f2] border rounded-xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-1 p-5" style={{ borderColor: rustBrown + "40" }}>
        <div className="flex items-center gap-4 mb-3">
          <div className="px-2 py-2 rounded bg-gradient-to-r from-black to-[#B7410E] shadow-lg">{roleIcon}</div>
          <h3 className="text-lg font-bold">{user.name}</h3>
        </div>
        <p className="text-sm text-black/70 mb-3">{user.email}</p>
        <div className="flex justify-end gap-2">
          <button className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition" onClick={() => setIsEditing(true)}>Edit</button>
          <button className="bg-[#B7410E] text-white px-3 py-1 rounded hover:bg-[#8a300b] transition" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      {/* Modal */}
      
{isEditing && (
  <div 
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={() => setIsEditing(false)} // Close on outside click
  >
    <div 
      className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative"
      onClick={(e) => e.stopPropagation()} // Prevent modal click from closing
    >
      {/* Close Button */}
      <button
        onClick={() => setIsEditing(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold"
      >
        &times;
      </button>

      <h2 className="text-xl font-semibold mb-4">Edit User</h2>
      <input
        type="text"
        value={editData.name}
        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
        className="border px-3 py-2 rounded w-full mb-3"
        placeholder="Name"
      />
      <input
        type="email"
        value={editData.email}
        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
        className="border px-3 py-2 rounded w-full mb-3"
        placeholder="Email"
      />
      <select
        value={editData.role}
        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
        className="border px-3 py-2 rounded w-full mb-4"
      >
        <option value="ADMIN">ADMIN</option>
        <option value="PROVIDER">PROVIDER</option>
        <option value="CUSTOMER">CUSTOMER</option>
      </select>
      <div className="flex justify-end gap-2">
        <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
        <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
      </div>
    </div>
  </div>
)}

    </>
  );
}

// Services Full
function ServicesCardFull({ services, setServices }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} setServices={setServices} services={services} />
      ))}
    </div>
  );
}

// Service Card with Modal
function ServiceCard({ service, services, setServices }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...service });

  const icon =
  (service.category || "").toLowerCase() === "carpentry" ? <GiHammerNails className="text-white" /> :
    (service.category || "").toLowerCase() === "electrical" ? <GiElectric className="text-white" /> :
    (service.category || "").toLowerCase() === "cleaning" ? <GiBroom className="text-white" /> :
    <GiHammerNails className="text-white" />;
  const handleSave = async () => {
    try {
      await updateService(service.id, editData);
      setServices(services.map((s) => (s.id === service.id ? editData : s)));
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
      console.log("Deleting service id:", service.id);

      setServices(services.filter((s) => s.id !== service.id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete service.");
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between bg-white border rounded-xl shadow-lg hover:shadow-xl transition p-5 border-gray-200" style={{ borderColor: rustBrown + "40" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-black to-[#B7410E] shadow-lg">{icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{service.category} - {service.subcategory}</h3>
            <p className="text-sm text-black/70">Provider: {service.providerName}</p>
          </div>
        </div>
        <p className="text-sm text-black/70 mb-4">{service.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-black text-lg">₹{service.price}</span>
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(true)} className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition">Edit</button>
            <button onClick={handleDelete} className="bg-[#B7410E] text-white px-3 py-1 rounded hover:bg-[#8a300b] transition">Delete</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isEditing && (
  <div 
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={() => setIsEditing(false)}
  >
    <div 
      className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={() => setIsEditing(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold"
      >
        &times;
      </button>

      <h2 className="text-xl font-semibold mb-4">Edit Service</h2>
      <input
        type="text"
        value={editData.description}
        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
        className="border px-3 py-2 rounded w-full mb-3"
        placeholder="Description"
      />
      <input
        type="number"
        value={editData.price}
        onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
        className="border px-3 py-2 rounded w-full mb-3"
        placeholder="Price"
      />
      <input
        type="text"
        value={editData.availability}
        onChange={(e) => setEditData({ ...editData, availability: e.target.value })}
        className="border px-3 py-2 rounded w-full mb-4"
        placeholder="Availability"
      />
      <div className="flex justify-end gap-2">
        <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
        <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Cancel</button>
      </div>
    </div>
  </div>
)}
</>
  );
}
function AdminChatSection({ users }) {
  const [selectedUser, setSelectedUser] = useState(null);

  // Show only providers and customers (not admins)
  const chatUsers = users.filter(
    (u) => (u.role || "").toLowerCase() !== "admin"
  );

  return (
    <div className="flex flex-col md:flex-row  h-[90vh] bg-white rounded-xl shadow-lg border border-[#6e290c30] overflow-hidden">
      {/* User List Sidebar */}
      <div className="md:w-1/3 w-full bg-[#fff8f4] border-r border-[#6e290c30] overflow-y-auto" >
        <div className="sticky top-0 bg-[#6e290c] text-white p-4 font-semibold text-lg flex items-center justify-between" >
          <span>Chats</span>
          <span className="text-sm font-normal opacity-80" >
            {chatUsers.length} users
          </span>
        </div>

        {chatUsers.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm text-center" >
            No users available
          </div>
        ) : (
          chatUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`p-4 border-b border-[#6e290c20] cursor-pointer transition-colors duration-200 ${
                selectedUser?.id === u.id
                  ? "bg-[#6e290c] text-white"
                  : "hover:bg-[#f8e9e2] text-gray-800"
              }`}
            >
              <div className="flex justify-between items-center" >
                <div>
                  <p className="font-semibold text-base">{u.name}</p>
                  <p
                    className={`text-xs ${
                      selectedUser?.id === u.id
                        ? "text-white/70"
                        : "text-gray-600"
                    }`}
                  >
                    {u.role}
                  </p>
                </div>
                <span
                  className={`w-3 h-3 rounded-full ${
                    selectedUser?.id === u.id
                      ? "bg-green-300"
                      : "bg-gray-300"
                  }`}
                  title="Online status"
                ></span>
              </div>
            </div>
          ))
        )}
      </div>

     {/* Right panel: Chat area */}
<div className="flex-1 flex flex-col bg-white h-[30rem]">
  <div className="flex flex-col flex-grow border-l border-[#6e290c30]">
    {selectedUser ? (
      <>
        {/* Header */}
        

        {/* ChatComponent — full height below header */}
        <div className="flex-1 h-96">
          <ChatComponent receiverId={selectedUser.id}  />
        </div>
      </>
    ) : (
      <div className="flex items-center justify-center flex-1 text-gray-500">
        Select a user to start chatting
      </div>
    )}
  </div>
</div>
    </div>
  );
}
function VerifyDocumentsTab() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await getAllDocuments();
        setDocuments(res.data);
      } catch (err) {
        console.error("Error loading docs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveDocument(id);
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, approved: true } : d))
      );
      alert("Provider verified successfully!");
    } catch (err) {
      console.error(err);
      alert("Approval failed");
    }
  };

  
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  if (loading) return <p>Loading documents...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        Provider Document Verification
      </h2>

      {documents.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {documents.map((doc) => (
    <div
      key={doc.id}
      className="border rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 flex flex-col justify-between min-h-[240px]"
    >
      <h3 className="font-semibold text-lg mb-2 break-words">{doc.fileName}</h3>
      <p className="text-sm text-gray-600 mb-1 break-words">
        Provider: {doc.providerName || "Unknown"}
      </p>
      <p className="text-xs text-gray-500 mb-2">
        Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
      </p>
      <a
        href={`http://localhost:8080/${doc.fileUrl.replace(/\\/g, "/")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline text-sm mb-3 inline-block break-words"
      >
        View Document
      </a>

      <div className="flex justify-between items-center  pt-2 border-t border-gray-200">
        {doc.approved ? (
          <span className="flex items-center text-green-600 font-semibold">
            <CheckCircleIcon className="w-5 h-5 mr-1" />
            Approved
          </span>
        ) : (
          <button
            onClick={() => handleApprove(doc.id)}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            Approve
          </button>
        )}

        <TrashIcon
          onClick={() => handleDelete(doc.id)}
          className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-800"
        />
      </div>
    </div>
  ))}
</div>

      
      )}
    </div>
  );
}