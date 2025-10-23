// Simple geocode cache to prevent re-fetching same locations
const geoCache = {};

export const geocodeLocation = async (location) => {
  if (!location) return null;
  if (geoCache[location]) return geoCache[location]; // use cached
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const coords = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
      geoCache[location] = coords;
      return coords;
    }
  } catch (err) {
    console.error("Geocoding error:", err);
  }
  return null;
};
