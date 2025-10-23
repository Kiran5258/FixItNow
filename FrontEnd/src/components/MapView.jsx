import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Default blue marker
const defaultIcon = new L.Icon.Default();

// Red marker for hovered/selected service
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Validate latitude and longitude
const isValidLatLng = (lat, lon) =>
  typeof lat === "number" &&
  typeof lon === "number" &&
  !isNaN(lat) &&
  !isNaN(lon) &&
  lat >= -90 &&
  lat <= 90 &&
  lon >= -180 &&
  lon <= 180;

// Auto-center and zoom
function MapAutoCenter({ services, hoveredServiceId, center }) {
  const map = useMap();
  const validServices = services.filter((s) =>
    isValidLatLng(s.latitude, s.longitude)
  );

  useEffect(() => {
    if (center && isValidLatLng(center.lat, center.lon)) {
      map.flyTo([center.lat, center.lon], 14, { duration: 1.2 });
    }
  }, [center, map]);

  useEffect(() => {
    if (hoveredServiceId) {
      const service = validServices.find((s) => s.id === hoveredServiceId);
      if (service) {
        map.flyTo([service.latitude, service.longitude], 15, { duration: 1.2 });
      }
    }
  }, [hoveredServiceId, validServices, map]);

  useEffect(() => {
    if (
      validServices.length > 1 &&
      !hoveredServiceId &&
      !(center && center.lat && center.lon)
    ) {
      const bounds = L.latLngBounds(
        validServices.map((s) => [s.latitude, s.longitude])
      );
      map.fitBounds(bounds, { padding: [60, 60] });
    } else if (
      validServices.length === 1 &&
      !hoveredServiceId &&
      !(center && center.lat && center.lon)
    ) {
      const only = validServices[0];
      map.setView([only.latitude, only.longitude], 14);
    }
  }, [validServices, hoveredServiceId, center, map]);

  return null;
}

// Circular offset for overlapping markers
const getCircleOffset = (lat, lon, index, total) => {
  if (total === 1) return [lat, lon];
  const angle = (index * 360) / total; // degrees
  const radius = 0.0001; // ~10m
  const rad = (angle * Math.PI) / 180;
  return [lat + radius * Math.cos(rad), lon + radius * Math.sin(rad)];
};

// Main MapView
export default function MapView({ services, hoveredServiceId, center }) {
  const validServices = services.filter((s) =>
    isValidLatLng(s.latitude, s.longitude)
  );

  const defaultPosition =
    validServices.length > 0
      ? [validServices[0].latitude, validServices[0].longitude]
      : [20.5937, 78.9629];

  const markerRefs = useRef({});

  useEffect(() => {
    if (hoveredServiceId && markerRefs.current[hoveredServiceId]) {
      markerRefs.current[hoveredServiceId].openPopup();
    }
  }, [hoveredServiceId]);

  // Group services by identical lat/lng
  const grouped = {};
  validServices.forEach((s) => {
    const key = `${s.latitude},${s.longitude}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  return (
    <MapContainer
      center={defaultPosition}
      zoom={12}
      scrollWheelZoom={true}
      style={{
        height: "400px",
        width: "100%",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {Object.values(grouped).map((group) =>
        group.map((s, index) => {
          const pos = getCircleOffset(s.latitude, s.longitude, index, group.length);
          return (
            <Marker
              key={s.id}
              position={pos}
              icon={s.id === hoveredServiceId ? redIcon : defaultIcon}
              ref={(ref) => {
                if (ref) markerRefs.current[s.id] = ref;
              }}
            >
              <Popup>
                <div className="font-semibold">{s.providerName || s.name}</div>
                <div>
                  {s.category} {s.subcategory ? `- ${s.subcategory}` : ""}
                </div>
                {s.price && <div>₹{s.price}</div>}
                {s.location && <div>{s.location}</div>}
              </Popup>
            </Marker>
          );
        })
      )}

      <MapAutoCenter
        services={validServices}
        hoveredServiceId={hoveredServiceId}
        center={center}
      />
    </MapContainer>
  );
}