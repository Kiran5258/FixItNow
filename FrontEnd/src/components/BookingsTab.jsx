import React from "react";

export default function BookingsTab({ bookings }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow">
      <h2 className="text-xl font-semibold mb-3" style={{ color: "#6e290cff" }}>
        My Bookings
      </h2>
      <div className="divide-y divide-gray-200">
        {bookings.map((b) => (
          <div key={b.id} className="flex justify-between py-2">
            <span>{b.service}</span>
            <span className="text-gray-600">{b.provider}</span>
            <span className={`font-medium ${b.status === "Confirmed" ? "text-green-600" : ""}`}>{b.status}</span>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-gray-500">No bookings yet.</p>}
      </div>
    </div>
  );
}
