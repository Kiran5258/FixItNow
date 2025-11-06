import React from 'react';

const rustBrown = "#6e290cff";

export default function MetricCard({ title, value, icon }) {
  return (
    <div className="bg-white border p-5 rounded-xl shadow-md flex flex-col items-center justify-center gap-3" style={{ borderColor: rustBrown + "40" }}>
      <div className="text-3xl">{icon}</div>
      <h2 className="text-2xl font-bold">{value}</h2>
      <p className="text-sm text-black/70">{title}</p>
    </div>
  );
}
