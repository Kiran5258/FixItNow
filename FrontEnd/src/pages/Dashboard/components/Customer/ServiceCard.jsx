import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiUser } from 'react-icons/fi';

export default function ServiceCard({ service, setMapCenter, setHoveredServiceId }) {
  const navigate = useNavigate();
  const isNotAvailable = service.availability?.toLowerCase() === 'not available';

  const handleViewLocation = () => {
    if (service.latitude && service.longitude) {
      setMapCenter({ lat: service.latitude, lon: service.longitude });
      setHoveredServiceId(service.id);
    } else {
      alert('Location not available for this service.');
    }
  };

  const handleViewDetails = () => {
    navigate(`/provider/${service.providerId || service.id}`);
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
            isNotAvailable ? 'bg-gray-400' : 'bg-green-500 animate-pulse'
          }`}
        />
        <span className="text-xs font-medium">{isNotAvailable ? 'Not Available' : service.availability}</span>
      </div>

      <button onClick={handleViewLocation} className="w-full mb-2 text-sm font-semibold text-blue-600 hover:underline flex items-center justify-center gap-1">
        <FiMapPin /> View Location
      </button>

      <div className="border-t border-gray-100 my-3"></div>

      <div className="flex justify-between items-center mt-auto">
        <span className="font-bold text-blue-600 text-lg">₹{service.price}</span>
        <button onClick={handleViewDetails} className="px-6 py-2 rounded-full font-semibold text-white shadow-md transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-blue-700">
          View Details
        </button>
      </div>
    </div>
  );
}
