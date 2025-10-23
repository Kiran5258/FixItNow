import React from "react";
import MetricCard from "./MetricCard";
import ServiceCard from "./ServiceCard";

const rustBrown = "#6e290cff";

export default function HomeTab({ customer, bookings, services, handleBookService }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-4">Welcome, {customer.name} 👋</h1>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Bookings"
          value={bookings.length}
          icon="📋"
        />
        <MetricCard
          title="Available Services"
          value={services.length}
          icon="🛠️"
        />
        <MetricCard
          title="Avg. Rating"
          value={"4.6"}
          icon="⭐"
        />
      </div>

      {/* Top Providers */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4" style={{ color: rustBrown }}>
          Top Providers Near You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.slice(0, 4).map((s) => (
            <div
              key={s.id}
              className="flex justify-between items-center p-4 rounded-lg shadow hover:shadow-lg transition bg-gradient-to-r from-orange-50 to-white"
            >
              <div>
                <p className="font-bold">{s.providerName}</p>
                <p className="text-sm text-gray-600">{s.category}</p>
              </div>
              <span className="text-yellow-500 font-semibold">★ {s.rating}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4" style={{ color: rustBrown }}>
          Upcoming Bookings
        </h2>
        {bookings.filter((b) => b.status === "Confirmed").slice(0, 3).map((b) => (
          <div key={b.id} className="flex justify-between py-2 border-b last:border-b-0">
            <p className="font-medium">{b.service}</p>
            <span className="text-sm text-gray-600">{b.provider}</span>
          </div>
        ))}
        {bookings.filter((b) => b.status === "Confirmed").length === 0 && (
          <p className="text-gray-500">No upcoming bookings</p>
        )}
      </div>

      {/* Recommended Services */}
      <div>
        <h2 className="text-xl font-semibold mb-4" style={{ color: rustBrown }}>
          Recommended For You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.slice(0, 3).map((s) => (
            <ServiceCard key={s.id} service={s} handleBookService={handleBookService} />
          ))}
        </div>
      </div>

      {/* Daily Tip */}
      <div className="bg-gradient-to-r from-blue-100 to-indigo-50 p-6 rounded-xl flex justify-between items-center shadow-md hover:shadow-lg transition">
        <div>
          <h3 className="font-bold text-lg">Today's Tip 🌤️</h3>
          <p className="text-gray-700">
            It’s sunny today! Perfect time to get your solar panel cleaned.
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Find Nearby Services
        </button>
      </div>
    </div>
  );
}
