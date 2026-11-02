import { useCallback, useContext, useEffect, useState } from "react";
import { WalkContext } from "../context/WalkContext";
import { reverseGeocode } from "../utils/geocode";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// OpenStreetMap tiles do not use the CARTO endpoint that showed
// "API KEY REQUIRED". Night mode is applied with CSS to the tile pane.
const OSM_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const liveLocationIcon = L.divIcon({
  className: "",
  html: `<div class="live-location-marker"><div class="pulse"></div><div class="dot"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const destinationIcon = L.divIcon({
  className: "",
  html: `<div class="destination-marker">📍</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 28],
});

const safePlaceIcons = {
  police: L.divIcon({
    className: "",
    html: `<div class="destination-marker">👮</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 24],
  }),
  hospital: L.divIcon({
    className: "",
    html: `<div class="destination-marker">🏥</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 24],
  }),
  pharmacy: L.divIcon({
    className: "",
    html: `<div class="destination-marker">💊</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 24],
  }),
  fuel: L.divIcon({
    className: "",
    html: `<div class="destination-marker">⛽</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 24],
  }),
};

const busyPlaceIcon = L.divIcon({
  className: "",
  html: `<div class="destination-marker">🏙️</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 22],
});

function isNightTimeNow() {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 6;
}

function RecenterMap({ position, shouldRecenter }) {
  const map = useMap();

  useEffect(() => {
    if (shouldRecenter && position) {
      map.setView(position, map.getZoom());
    }
  }, [position, shouldRecenter, map]);

  return null;
}

function RecenterButton({ position }) {
  const map = useMap();

  return (
    <button
      type="button"
      onClick={() => map.setView(position, 16)}
      title="Recenter on my location"
      aria-label="Recenter on my location"
      className="absolute bottom-4 right-4 z-[1000] bg-[#171717] border border-gray-700 w-11 h-11 rounded-full flex items-center justify-center text-lg shadow-lg hover:bg-[#222]"
    >
      🎯
    </button>
  );
}

function MapClickHandler({ active, onPick }) {
  useMapEvents({
    click(event) {
      if (active) onPick(event.latlng);
    },
  });
  return null;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function MapComponent({ pickingOnMap = false, onDestinationPicked = () => {} }) {
  const {
    path = [],
    setPath,
    setDistance,
    source,
    setSource,
    destinationCoords,
    tracking,
    currentPosition,
    setCurrentPosition,
  } = useContext(WalkContext);

  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [nightMode, setNightMode] = useState(isNightTimeNow());
  const [showSafePlaces, setShowSafePlaces] = useState(false);
  const [safePlaces, setSafePlaces] = useState([]);
  const [loadingSafePlaces, setLoadingSafePlaces] = useState(false);
  const [showBusyPlaces, setShowBusyPlaces] = useState(false);
  const [busyPlaces, setBusyPlaces] = useState([]);
  const [loadingBusyPlaces, setLoadingBusyPlaces] = useState(false);
  const [locationError, setLocationError] = useState("");

  const position = currentPosition
    ? [currentPosition.lat, currentPosition.lon]
    : [11.0168, 76.9558]; // Coimbatore fallback until GPS is available

  // Watch the user's location while this map is mounted.
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported by this browser.");
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocationError("");
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCurrentPosition({ lat, lon });

        if (!source) {
          setSource(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
          reverseGeocode(lat, lon)
            .then((place) => {
              if (place?.label) setSource(place.label);
            })
            .catch(() => {});
        }

        // Record distance only while a walk is actively being tracked.
        if (tracking) {
          setPath((previousPath) => {
            const last = previousPath[previousPath.length - 1];
            if (last && calculateDistance(last[0], last[1], lat, lon) < 0.003) {
              return previousPath;
            }

            if (last) {
              const distanceKm = calculateDistance(last[0], last[1], lat, lon);
              setDistance((previousDistance) => previousDistance + distanceKm);
            }
            return [...previousPath, [lat, lon]];
          });
        }
      },
      (error) => {
        console.warn("Unable to get current location:", error.message);
        setLocationError(
          error.code === 1
            ? "Location permission denied. Allow location access in your browser."
            : "Unable to get your location. Check GPS and try again."
        );
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [setCurrentPosition, setDistance, setPath, setSource, source, tracking]);

  // Get a route to the selected destination. OSRM's public demo service
  // primarily supports driving; this route is a route estimate, not a safety rating.
  useEffect(() => {
    if (!destinationCoords) {
      setRoutes([]);
      return undefined;
    }

    const controller = new AbortController();

    async function fetchRoute() {
      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${position[1]},${position[0]};${destinationCoords.lon},${destinationCoords.lat}` +
          `?overview=full&geometries=geojson&alternatives=true`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Route request failed: ${response.status}`);
        const data = await response.json();

        if (data.code !== "Ok" || !data.routes?.length) {
          setRoutes([]);
          return;
        }

        setRoutes(
          data.routes.map((route) => ({
            coords: route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
            distanceKm: (route.distance / 1000).toFixed(2),
            durationMin: Math.round(route.duration / 60),
          }))
        );
        setSelectedRoute(0);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.warn("Could not load route:", error);
          setRoutes([]);
        }
      }
    }

    fetchRoute();
    return () => controller.abort();
    // Current position is intentionally omitted to avoid repeated route requests
    // for every GPS update; destination changes trigger a new request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationCoords]);

  const fetchNearbyPlaces = useCallback(async (kind) => {
    const [lat, lon] = position;
    const radius = kind === "safe" ? 1500 : 1000;
    const query =
      kind === "safe"
        ? `
          [out:json][timeout:20];
          (
            node["amenity"="police"](around:${radius},${lat},${lon});
            way["amenity"="police"](around:${radius},${lat},${lon});
            node["amenity"="hospital"](around:${radius},${lat},${lon});
            way["amenity"="hospital"](around:${radius},${lat},${lon});
            node["amenity"="pharmacy"](around:${radius},${lat},${lon});
            way["amenity"="pharmacy"](around:${radius},${lat},${lon});
            node["amenity"="fuel"](around:${radius},${lat},${lon});
            way["amenity"="fuel"](around:${radius},${lat},${lon});
          );
          out center 30;
        `
        : `
          [out:json][timeout:20];
          (
            node["amenity"~"restaurant|cafe|bus_station"](around:${radius},${lat},${lon});
            way["amenity"~"restaurant|cafe|bus_station"](around:${radius},${lat},${lon});
            node["highway"="bus_stop"](around:${radius},${lat},${lon});
            node["shop"~"supermarket|convenience|mall"](around:${radius},${lat},${lon});
            way["shop"~"supermarket|convenience|mall"](around:${radius},${lat},${lon});
          );
          out center 35;
        `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: query,
    });

    if (!response.ok) throw new Error(`Places request failed: ${response.status}`);
    const data = await response.json();

    return (data.elements || [])
      .map((element) => {
        const latValue = element.lat ?? element.center?.lat;
        const lonValue = element.lon ?? element.center?.lon;
        if (latValue == null || lonValue == null) return null;

        const tags = element.tags || {};
        return {
          id: `${element.type}-${element.id}`,
          type: tags.amenity || tags.shop || tags.highway || "public",
          name: tags.name || tags.amenity || tags.shop || tags.highway || "Nearby place",
          lat: latValue,
          lon: lonValue,
        };
      })
      .filter(Boolean);
  }, [position[0], position[1]]);

  useEffect(() => {
    if (!showSafePlaces) return undefined;
    let cancelled = false;

    setLoadingSafePlaces(true);
    fetchNearbyPlaces("safe")
      .then((places) => {
        if (!cancelled) setSafePlaces(places);
      })
      .catch((error) => {
        if (!cancelled) {
          console.warn("Could not load safe places:", error);
          setSafePlaces([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSafePlaces(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showSafePlaces, fetchNearbyPlaces]);

  useEffect(() => {
    if (!showBusyPlaces) return undefined;
    let cancelled = false;

    setLoadingBusyPlaces(true);
    fetchNearbyPlaces("busy")
      .then((places) => {
        if (!cancelled) setBusyPlaces(places);
      })
      .catch((error) => {
        if (!cancelled) {
          console.warn("Could not load busy places:", error);
          setBusyPlaces([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingBusyPlaces(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showBusyPlaces, fetchNearbyPlaces]);

  const handleMapPick = useCallback(async (latlng) => {
    let label = `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`;
    try {
      const place = await reverseGeocode(latlng.lat, latlng.lng);
      if (place?.label) label = place.label;
    } catch {
      // Coordinates remain a valid destination if reverse geocoding fails.
    }
    onDestinationPicked({ lat: latlng.lat, lon: latlng.lng, label });
  }, [onDestinationPicked]);

  return (
    <div className={`relative safety-map ${nightMode ? "night-map" : "day-map"}`}>
      {locationError && (
        <div
          role="status"
          className="mb-2 rounded-lg border border-amber-600/50 bg-amber-900/30 px-3 py-2 text-sm text-amber-200"
        >
          {locationError}
        </div>
      )}

      <MapContainer
        center={position}
        zoom={16}
        scrollWheelZoom
        className="safety-map-container"
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "20px",
          cursor: pickingOnMap ? "crosshair" : "grab",
        }}
      >
        <TileLayer
          key="openstreetmap-tiles"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={OSM_TILES}
          maxZoom={19}
        />

        <MapClickHandler active={pickingOnMap} onPick={handleMapPick} />
        <RecenterMap position={position} shouldRecenter={!destinationCoords} />
        <RecenterButton position={position} />

        <Marker position={position} icon={liveLocationIcon}>
          <Popup>📍 Your Current Location</Popup>
        </Marker>

        {destinationCoords && (
          <Marker
            position={[destinationCoords.lat, destinationCoords.lon]}
            icon={destinationIcon}
          >
            <Popup>🏁 Destination</Popup>
          </Marker>
        )}

        {safePlaces.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lon]}
            icon={safePlaceIcons[place.type] || safePlaceIcons.police}
          >
            <Popup>
              {place.type === "police" && "👮 Police: "}
              {place.type === "hospital" && "🏥 Hospital: "}
              {place.type === "pharmacy" && "💊 Pharmacy: "}
              {place.type === "fuel" && "⛽ Fuel station: "}
              {place.name}
            </Popup>
          </Marker>
        ))}

        {busyPlaces.map((place) => (
          <Marker key={`busy-${place.id}`} position={[place.lat, place.lon]} icon={busyPlaceIcon}>
            <Popup>🏙️ {place.name}</Popup>
          </Marker>
        ))}

        {routes.map((route, index) => (
          <Polyline
            key={`route-${index}`}
            positions={route.coords}
            pathOptions={
              index === selectedRoute
                ? { color: "#1a73e8", weight: 5, opacity: 0.9 }
                : { color: "#9ca3af", weight: 4, opacity: 0.55, dashArray: "6 8" }
            }
            eventHandlers={{ click: () => setSelectedRoute(index) }}
          />
        ))}

        {tracking && path.length > 1 && (
          <Polyline
            positions={path}
            pathOptions={{ color: "#34a853", weight: 4, opacity: 0.9 }}
          />
        )}
      </MapContainer>

      {routes.length > 0 && (
        <div className="absolute top-4 left-4 z-[1000] max-w-[220px] rounded-xl border border-gray-700 bg-[#171717]/95 px-4 py-3 text-sm shadow-lg">
          {routes.length > 1 && (
            <p className="mb-2 text-xs text-gray-400">
              {routes.length} route options — select a route
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            {routes.map((route, index) => (
              <button
                type="button"
                key={`route-button-${index}`}
                onClick={() => setSelectedRoute(index)}
                className={`rounded-lg px-2 py-1.5 text-left ${
                  index === selectedRoute
                    ? "border border-blue-500 bg-blue-600/20"
                    : "hover:bg-white/5"
                }`}
              >
                <span className={index === selectedRoute ? "font-semibold text-blue-400" : "text-gray-300"}>
                  {route.distanceKm} km
                </span>
                {route.durationMin != null && (
                  <span className="text-gray-400"> · ~{route.durationMin} min</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setNightMode((value) => !value)}
          title="Toggle map night mode"
          className={`rounded-xl border px-3 py-2 text-sm font-medium shadow-lg ${
            nightMode
              ? "border-blue-500 bg-blue-600 text-white"
              : "border-gray-700 bg-[#171717] text-gray-300"
          }`}
        >
          {nightMode ? "🌙 Night" : "☀️ Day"}
        </button>

        <button
          type="button"
          onClick={() => setShowSafePlaces((value) => !value)}
          title="Show nearby police stations, hospitals, pharmacies and fuel stations"
          className={`whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-medium shadow-lg ${
            showSafePlaces
              ? "border-green-500 bg-green-600 text-white"
              : "border-gray-700 bg-[#171717] text-gray-300"
          }`}
        >
          {loadingSafePlaces ? "Loading..." : "🛡️ Safe Places"}
        </button>

        <button
          type="button"
          onClick={() => setShowBusyPlaces((value) => !value)}
          title="Show nearby public places"
          className={`whitespace-nowrap rounded-xl border px-3 py-2 text-sm font-medium shadow-lg ${
            showBusyPlaces
              ? "border-orange-500 bg-orange-600 text-white"
              : "border-gray-700 bg-[#171717] text-gray-300"
          }`}
        >
          {loadingBusyPlaces ? "Loading..." : "🏙️ Busy Areas"}
        </button>
      </div>
    </div>
  );
}

export default MapComponent;
