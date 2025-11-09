import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

const rustBrown = "#6e290c";

// Marker colors based on booking status
const iconColors = {
  COMPLETED:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  CONFIRMED:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  PENDING:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  CANCELLED:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  DEFAULT:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
};

// Create dynamic Leaflet icon
const createIcon = (status) =>
  new L.Icon({
    iconUrl: iconColors[status] || iconColors.DEFAULT,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

// ✅ Sub-component to handle clusters
function ClusterLayer({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (!map || markers.length === 0) return;

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnEveryZoom: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div style="
            background:${rustBrown};
            color:white;
            width:36px;
            height:36px;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            font-weight:bold;
            border:2px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,0.3);
          ">${count}</div>`,
          className: "custom-cluster",
          iconSize: L.point(36, 36, true),
        });
      },
    });

    markers.forEach((mk) => {
      const icon = createIcon(mk.status);
      const marker = L.marker([mk.position.lat, mk.position.lng], { icon });

      // 📍 Stylish popup design
      const popupContent = `
        <div style="font-family: 'Segoe UI', sans-serif; line-height: 1.5; min-width: 180px;">
          <div style="font-weight:600; color:${rustBrown}; margin-bottom:4px; font-size:14px;">
            ${mk.service}${mk.sub ? " - " + mk.sub : ""}
          </div>
          <div style="font-size:13px;">
            <b>Provider:</b> ${mk.provider}<br/>
            <b>Customer:</b> ${mk.customer}<br/>
            <b>Price:</b> ₹${mk.price}<br/>
            <b>Location:</b> ${mk.customerLocation}<br/>
            <b>Date:</b> ${mk.date}<br/>
            <b>Status:</b> 
            <span style="
              background-color:${
                mk.status === "COMPLETED"
                  ? "#16a34a"
                  : mk.status === "CANCELLED"
                  ? "#dc2626"
                  : mk.status === "CONFIRMED"
                  ? "#f97316"
                  : "#eab308"
              };
              color:white;
              font-weight:600;
              font-size:11px;
              border-radius:6px;
              padding:2px 6px;
            ">
              ${mk.status}
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      clusterGroup.addLayer(marker);
    });

    clusterGroup.addTo(map);

    // Fit map bounds
    const bounds = clusterGroup.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });

    // Cleanup on unmount
    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, markers]);

  return null;
}

// ✅ Main Component
export default function ServiceLocationMap({ bookings = [] }) {
  const coordinates = useMemo(
    () => ({
      coimbatore: { lat: 11.0168, lng: 76.9558 },
      erode: { lat: 11.341, lng: 77.7172 },
      salem: { lat: 11.6643, lng: 78.146 },
      trichy: { lat: 10.7905, lng: 78.7047 },
      sivagangai: { lat: 9.847, lng: 78.4812 },
      krishnagiri: { lat: 12.5192, lng: 78.2138 },
      chennai: { lat: 13.0827, lng: 80.2707 },
      madurai: { lat: 9.9252, lng: 78.1198 },
      namakkal: { lat: 11.2189, lng: 78.1677 },
      vellore: { lat: 12.9165, lng: 79.1325 },
      tirunelveli: { lat: 8.7139, lng: 77.7567 },
      dindigul: { lat: 10.3673, lng: 77.9803 },
      "sri krishna college of engineering": { lat: 10.9383, lng: 76.9284 },
    }),
    []
  );

  // Prepare markers based on customer location
  const markers = useMemo(() => {
    const data = [];

    bookings.forEach((b) => {
      const rawLoc = (b?.customer?.location || "").trim().toLowerCase();
      const normalized = rawLoc
        .replace(/\s+/g, " ")
        .replace(/tamil\s*nadu|india|district|city|,|-/gi, "")
        .trim();

      const coords =
        coordinates[normalized] ||
        Object.entries(coordinates).find(([key]) => normalized.includes(key))?.[1];

      if (!coords) return;

      data.push({
        id: b.id,
        position: coords,
        provider: b.provider?.name || "Provider",
        customer: b.customer?.name || "Customer",
        customerLocation: b.customer?.location || "Unknown",
        service: b.service?.category || "Service",
        sub: b.service?.subcategory || "",
        price: b.service?.price || 0,
        date: b.bookingDate || "-",
        status: b.status?.toUpperCase() || "UNKNOWN",
      });
    });

    console.log("✅ Total Markers:", data.length);
    return data;
  }, [bookings, coordinates]);

  return (
    <div
      style={{
        height: "440px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
      }}
    >
      <MapContainer
        center={[11.1271, 78.6569]}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Clustered Markers */}
        <ClusterLayer markers={markers} />
      </MapContainer>
    </div>
  );
}
