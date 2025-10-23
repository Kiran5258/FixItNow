import React, { useState } from "react";
import { MdAdminPanelSettings } from "react-icons/md";
import { createService, deleteService } from "../services/api";
import toast from "react-hot-toast";

export default function ServicesPanel({ services, setServices }) {
  const [newService, setNewService] = useState({
    category: "",
    subcategory: "",
    description: "",
    price: "",
    availability: "",
  });

  const handleAddService = async () => {
    try {
      if (!newService.category || !newService.subcategory || !newService.price) {
        toast.error("Fill all required fields");
        return;
      }
      const res = await createService(newService);
      setServices([...services, res.data]);
      setNewService({
        category: "",
        subcategory: "",
        description: "",
        price: "",
        availability: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create service");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await deleteService(id);
      setServices(services.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete service");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#6E290C]">
        <MdAdminPanelSettings /> Manage Services
      </h2>

      {/* Add Service */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <input
          type="text"
          placeholder="Category"
          className="border px-3 py-2 rounded"
          value={newService.category}
          onChange={(e) =>
            setNewService({ ...newService, category: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Subcategory"
          className="border px-3 py-2 rounded"
          value={newService.subcategory}
          onChange={(e) =>
            setNewService({ ...newService, subcategory: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Price"
          className="border px-3 py-2 rounded"
          value={newService.price}
          onChange={(e) =>
            setNewService({ ...newService, price: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Availability"
          className="border px-3 py-2 rounded"
          value={newService.availability}
          onChange={(e) =>
            setNewService({ ...newService, availability: e.target.value })
          }
        />
        <textarea
          placeholder="Description"
          className="border px-3 py-2 rounded md:col-span-2"
          value={newService.description}
          onChange={(e) =>
            setNewService({ ...newService, description: e.target.value })
          }
        />
        <button
          onClick={handleAddService}
          className="bg-[#6E290C] text-white rounded px-4 py-2 hover:bg-[#532108]"
        >
          Add Service
        </button>
      </div>

      {/* List Services */}
      <div className="divide-y">
        {services.map((s) => (
          <div
            key={s._id}
            className="flex justify-between py-3 px-2 hover:bg-gray-50 rounded"
          >
            <div>
              <h3 className="font-semibold">
                {s.category} - {s.subcategory}
              </h3>
              <p className="text-sm text-gray-500">{s.description}</p>
              <p className="text-sm font-medium text-[#6E290C]">
                ₹{s.price} | {s.availability}
              </p>
            </div>
            <button
              onClick={() => handleDelete(s._id)}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
