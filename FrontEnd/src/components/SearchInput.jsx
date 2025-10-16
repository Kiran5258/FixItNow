import React from "react";

export default function SearchInput({ icon, placeholder, value, onChange }) {
  return (
    <div className="flex items-center gap-2 border rounded-lg p-2 bg-white shadow-sm flex-1">
      {icon}
      <input
        type="text"
        placeholder={placeholder}
        className="outline-none flex-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
