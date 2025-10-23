import React from "react";

export default function Metric({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow text-center border border-gray-200">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-3xl font-bold text-[#6E290C] mt-2">{value}</p>
    </div>
  );
}
