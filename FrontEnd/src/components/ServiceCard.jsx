import React, { useState } from "react";
import { FiMapPin, FiUser, FiSearch } from "react-icons/fi";

export default function ServiceCard({ service, setMapCenter, setHoveredServiceId, handleBookService }) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  const isNotAvailable = service.availability?.toLowerCase() === "not available";

  const handleViewLocation = () => {
    if (service.latitude && service.longitude) {
      setMapCenter({ lat: service.latitude, lon: service.longitude });
      setHoveredServiceId(service.id);
    } else {
      alert("Location not available for this service.");
    }
  };

  const openBookingForm = () => setShowBookingForm(true);
  const closeBookingForm = () => setShowBookingForm(false);

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTimeSlot) {
      alert("Please select a date and time slot!");
      return;
    }
    handleBookService(service, selectedDate, selectedTimeSlot);
    closeBookingForm();
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
        <span className="text-xs font-medium">
          {isNotAvailable ? "Not Available" : service.availability}
        </span>
      </div>

      <button
        onClick={handleViewLocation}
        className="w-full mb-4 text-sm font-semibold text-blue-600 hover:underline flex items-center justify-center gap-1"
      >
        <FiMapPin /> View Location
      </button>

      <div className="border-t border-gray-100 my-3"></div>

      <div className="flex justify-between items-center mt-auto">
        <span className="font-bold text-blue-600 text-lg">₹{service.price}</span>
        <button
          className={`px-6 py-2.5 rounded-full font-semibold text-white shadow-md transition-all ${
            isNotAvailable
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-blue-700"
          }`}
          disabled={isNotAvailable}
          onClick={openBookingForm} // Open popup instead of direct booking
        >
          {isNotAvailable ? "Unavailable" : "Book Now"}
        </button>
      </div>

      {/* Booking Form Popup */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Book Service</h2>

            <label className="block mb-2 font-medium">Select Date</label>
            <input
              type="date"
              className="border p-2 rounded w-full mb-4"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <label className="block mb-2 font-medium">Select Time Slot</label>
            <select
              className="border p-2 rounded w-full mb-4"
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
            >
              <option value="">--Select--</option>
              <option value="09:00 - 11:00">09:00 - 11:00</option>
              <option value="11:00 - 01:00">11:00 - 01:00</option>
              <option value="02:00 - 04:00">02:00 - 04:00</option>
              <option value="04:00 - 06:00">04:00 - 06:00</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={closeBookingForm}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleConfirmBooking}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
