import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getPublicTrack } from "../api";

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

function timeAgo(dateStr) {
  if (!dateStr) return "never";
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function TrackWalk() {
  const { shareToken } = useParams();
  const [walk, setWalk] = useState(null);
  const [error, setError] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const data = await getPublicTrack(shareToken);
        setWalk(data);
        setError("");
      } catch (err) {
        setError(err.message || "This tracking link is invalid or has expired.");
      }
    };

    fetchTrack();
    intervalRef.current = setInterval(fetchTrack, 5000);

    return () => clearInterval(intervalRef.current);
  }, [shareToken]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F0F10] text-white flex items-center justify-center p-6">
        <div className="bg-[#171717] rounded-3xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-3">⚠ Link unavailable</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!walk) {
    return (
      <div className="min-h-screen bg-[#0F0F10] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading live location...</p>
      </div>
    );
  }

  const hasPosition = walk.currentLat != null && walk.currentLon != null;
  const center = hasPosition
    ? [walk.currentLat, walk.currentLon]
    : walk.destinationLat != null
    ? [walk.destinationLat, walk.destinationLon]
    : [11.0168, 76.9558];

  const statusStyles = {
    Ongoing: "text-blue-400",
    Safe: "text-green-500",
    SOS: "text-red-500",
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#171717] rounded-3xl p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            🛰️ {walk.userName}'s Live Walk
          </h1>
          <p className="text-gray-400">
            Heading to <span className="text-white">{walk.destination}</span>
          </p>

          <div className="flex flex-wrap gap-6 mt-4 text-sm">
            <span>
              Status:{" "}
              <span className={`font-bold ${statusStyles[walk.status] || "text-gray-300"}`}>
                {walk.status === "SOS" ? "🚨 SOS TRIGGERED" : walk.status}
              </span>
            </span>
            {walk.eta && <span>ETA: {walk.eta}</span>}
            <span>Last updated: {timeAgo(walk.lastUpdated)}</span>
          </div>

          {walk.status === "SOS" && (
            <div className="mt-4 bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 font-semibold">
              🚨 This person has triggered an emergency alert. Please check on them or contact local authorities if you can't reach them.
            </div>
          )}
        </div>

        <div className="bg-[#171717] rounded-3xl p-4">
          <MapContainer
            center={center}
            zoom={15}
            style={{ height: "450px", width: "100%", borderRadius: "16px" }}
          >
           
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

            {hasPosition && (
              <Marker position={[walk.currentLat, walk.currentLon]} icon={liveLocationIcon}>
                <Popup>📍 Current location</Popup>
              </Marker>
            )}

            {walk.destinationLat != null && (
              <Marker
                position={[walk.destinationLat, walk.destinationLon]}
                icon={destinationIcon}
              >
                <Popup>🏁 Destination</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          This page refreshes automatically every 5 seconds. Powered by SafetyWalk.
        </p>
      </div>
    </div>
  );
}

export default TrackWalk;
