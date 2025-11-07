import React from 'react';
export default function SearchInput({ icon, placeholder, value, onChange }) {
  return (
    <div className="flex items-center border rounded px-3 py-2 bg-white shadow-sm w-full max-w-md">
      {icon}
      <input type="text" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="ml-2 w-full focus:outline-none" />
    </div>
  );
}
