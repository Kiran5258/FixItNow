import React, { useState, useRef, useEffect } from 'react';
import MapView from '../../../../components/MapView';
import ServiceCard from './ServiceCard';
import SearchInput from './SearchInput';

export default function ServicesTab({
  servicesWithDistance,
  hoveredServiceId,
  setHoveredServiceId,
  categorySearch,
  setCategorySearch,
  locationSearch,
  setLocationSearch,
  setSelectedService,
  setIsBookingModalOpen,
  openReviewModal,
  token,
  sortOption,
  setSortOption,
}) {
  const [mapCenter, setMapCenter] = useState(null);
  const [searchRadius, setSearchRadius] = useState();
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapCenter && mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [mapCenter]);

  const filteredSortedServices = (servicesWithDistance || [])
    .filter((s) => {
      const matchesCategory = categorySearch
        ? s.category?.toLowerCase().includes(categorySearch.toLowerCase())
        : true;

      const matchesLocation = locationSearch
        ? s.location?.toLowerCase().includes(locationSearch.toLowerCase())
        : true;

      const withinRadius =
        searchRadius && s.distance != null ? s.distance <= searchRadius : true;

      return matchesCategory && matchesLocation && withinRadius;
    })
    .sort((a, b) => {
      if (sortOption === 'rating') return (b.averageRating || 0) - (a.averageRating || 0);
      if (sortOption === 'distance') return (a.distance || 0) - (b.distance || 0);
      return 0;
    });

  return (
    <div className="p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Trusted Professionals Near You</h1>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">Discover verified service providers — electricians, plumbers, carpenters, and more.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 max-w-4xl mx-auto">
        <SearchInput icon={<></>} placeholder="Search by category..." value={categorySearch} onChange={setCategorySearch} />
        <SearchInput icon={<></>} placeholder="Search by location..." value={locationSearch} onChange={setLocationSearch} />
        <div className="flex items-center gap-2">
          <label className="text-gray-700 font-medium">Within (km):</label>
          <input
            type="number"
            value={searchRadius || ''}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            className="border px-2 py-1 rounded w-20"
            min={1}
            placeholder="e.g., 5"
          />
        </div>
      </div>

      <div className="mb-10 max-w-6xl mx-auto" ref={mapRef}>
        <MapView services={filteredSortedServices} hoveredServiceId={hoveredServiceId} center={mapCenter} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {filteredSortedServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            setMapCenter={setMapCenter}
            setHoveredServiceId={setHoveredServiceId}
            setSelectedService={setSelectedService}
            setIsBookingModalOpen={setIsBookingModalOpen}
            openReviewModal={openReviewModal}
          />
        ))}
      </div>
    </div>
  );
}
