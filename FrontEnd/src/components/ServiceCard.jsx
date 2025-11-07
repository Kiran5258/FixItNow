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
export default ServicesCardFull;