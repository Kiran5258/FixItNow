import React, { useState, useEffect, useRef } from "react";
import MapView from "../components/MapView";
import ServiceCard from "./ServiceCard";
import SearchInput from "./SearchInput";

export default function ServicesTab({
  services,
  hoveredServiceId,
  setHoveredServiceId,
  categorySearch,
  setCategorySearch,
  locationSearch,
  setLocationSearch,
  handleBookService,
}) {
  const [mapCenter, setMapCenter] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapCenter && mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [mapCenter]);

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Trusted Professionals Near You</h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
          Discover verified service providers — electricians, plumbers, carpenters, and more.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-4xl mx-auto">
        <SearchInput icon="🔍" placeholder="Search by category..." value={categorySearch} onChange={setCategorySearch} />
        <SearchInput icon="📍" placeholder="Search by location..." value={locationSearch} onChange={setLocationSearch} />
      </div>

      <div className="mb-10 max-w-6xl mx-auto" ref={mapRef}>
        <MapView services={services} hoveredServiceId={hoveredServiceId} center={mapCenter} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} setMapCenter={setMapCenter} setHoveredServiceId={setHoveredServiceId} handleBookService={handleBookService} />
        ))}
      </div>
    </div>
  );
}
