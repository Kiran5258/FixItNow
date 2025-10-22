import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BookingSummaryPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No booking details found.</p>
      </div>
    );
  }

  const { booking } = state;

  // Format date as "24 Oct 2025"
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-GB", options);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f6e5da] to-white p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 space-y-6 border border-[#f1c6ad] ">
        <h2 className="text-3xl font-bold text-[#6e290c]">Booking Confirmed!</h2>

        <div>
          <h3 className="font-semibold text-[#6e290c]">Service</h3>
          <p className="text-gray-700">{booking.service.subcategory || "Service Name"}</p>
        </div>

        <div>
          <h3 className="font-semibold text-[#6e290c]">Provider</h3>
          <p className="text-gray-700">{booking.providerName || "Provider Name"}</p>
        </div>

        <div>
          <h3 className="font-semibold text-[#6e290c]">Date & Time</h3>
          <p className="text-gray-700">
            {formatDate(booking.bookingDate)} | {booking.timeSlot}
          </p>
        </div>

        {booking.notes && (
          <div>
            <h3 className="font-semibold text-[#6e290c]">Notes</h3>
            <p className="text-gray-700">{booking.notes}</p>
          </div>
        )}

        <div>
          <h3 className="font-semibold text-[#6e290c]">Status</h3>
          <p className="text-gray-700">{booking.status || "PENDING"}</p>
        </div>

        <button
          onClick={() => navigate("/customer-dashboard")}
          className="mt-4 w-full py-3 bg-[#6e290c] text-white font-semibold rounded-2xl shadow hover:bg-[#a44a1d] transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
