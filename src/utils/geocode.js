// Photon (https://photon.komoot.io) — free, no API key, built on OpenStreetMap
// data but specifically designed for autocomplete/search-as-you-type, unlike
// raw Nominatim which is a general geocoder. Passing lat/lon biases results
// toward that location without hard-excluding everything else.

function buildLabel(props) {
  const parts = [
    props.name,
    props.street,
    props.district,
    props.city,
    props.state,
    props.country,
  ].filter(Boolean);

  // De-duplicate consecutive repeats (e.g. name === city)
  const deduped = parts.filter((part, i) => part !== parts[i - 1]);
  return deduped.join(", ");
}

export async function searchPlaces(query, { lat, lon } = {}, limit = 8) {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  if (lat != null && lon != null) {
    params.set("lat", lat);
    params.set("lon", lon);
    params.set("location_bias_scale", "0.8"); // strong pull toward nearby results
  }

  const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`);
  const data = await res.json();

  return (data.features || [])
    .filter((f) => f.properties?.name || f.properties?.street)
    .map((f) => ({
      id: `${f.properties.osm_type || ""}${f.properties.osm_id || Math.random()}`,
      label: buildLabel(f.properties),
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
    }));
}

export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({ lat, lon });
  const res = await fetch(`https://photon.komoot.io/reverse?${params.toString()}`);
  const data = await res.json();

  const feature = data.features?.[0];
  if (!feature) return null;

  return {
    label: buildLabel(feature.properties),
    lat: feature.geometry.coordinates[1],
    lon: feature.geometry.coordinates[0],
  };
}