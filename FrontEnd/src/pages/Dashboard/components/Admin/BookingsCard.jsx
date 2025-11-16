import React from 'react';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { FiClock, FiXCircle } from 'react-icons/fi';
import { BiClipboard } from 'react-icons/bi';

const rustBrown = "#6e290cff";

export default function BookingsCard({ bookings, loading }) {
  if (loading) return <div className="bg-white border rounded-lg p-4" style={{ borderColor: rustBrown + "40" }}>Loading bookings...</div>;

  const getStatusBadge = status => {
    if (!status) return null;
    switch(status.toLowerCase()) {
      case "completed": return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full"><AiOutlineCheckCircle /> {status}</span>;
      case "pending": return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full"><FiClock /> {status}</span>;
      case "cancelled": return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full"><FiXClock /> {status}</span>;
      case "confirmed": return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"><FiClock /> {status}</span>;
      default:
        return <span className="flex items-center gap-1 px-2 py-1 text-xs bg-black text-white rounded-full">{status}</span>;
    }
  };

  return (
    <div className="bg-white border rounded-xl p-6" style={{ borderColor: rustBrown + "40" }}>
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2" style={{ color: rustBrown }}>
        <BiClipboard /> Recent Bookings
      </h2>
      <div className="divide-y divide-black/10">
        {bookings.map((b) => (
          <div key={b.id} className="flex justify-between py-3 px-2 hover:bg-[rgba(183,65,14,0.1)] rounded-lg transition">
            <div>
              <p className="font-medium">{b.customer?.name}</p>
              <p className="text-sm text-black/70">{b.service?.category} - {b.service?.subcategory}</p>
            </div>
            <div>{getStatusBadge(b.status)}
              <h> ₹{b.service?.price}</h>
            </div>
          
          </div>
        ))}
      </div>
    </div>
  );
}
