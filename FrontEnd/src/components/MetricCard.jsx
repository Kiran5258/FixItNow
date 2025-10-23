// src/components/MetricCard.jsx
import React from "react";

export default function MetricCard({ title, value, icon }) {
  return (
    <div className="bg-white border p-5 rounded-xl shadow-md flex flex-col items-center justify-center gap-2 hover:shadow-lg transition">
      <div className="text-3xl">{icon}</div>
      <h2 className="text-xl font-bold">{value}</h2>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}
