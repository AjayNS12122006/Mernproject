import { useContext, useState, useEffect } from "react";
import { WalkContext } from "../context/WalkContext";
import { useAuth } from "../context/AuthContext";
import MapComponent from "../components/MapComponents";
import Sidebar from "../components/Sidebar";
import DestinationSearch from "../components/DestinationSearch";
import WhatsAppShareButton from "../components/WhatsAppShareButton";
import { startWalk, finishWalk, getProfile } from "../api";

function StartWalk() {
  const { token, user } = useAuth();

  const {
    destination,
    setDestination,
    destinationCoords,
    setDestinationCoords,
    eta,
    setEta,
    tracking,
    setTracking,
    setStartTime,
    startTime,
    source,
    walkId,
    setWalkId,
    shareToken,
    setShareToken,
    currentPosition,
  } = useContext(WalkContext);

  const [pickingOnMap, setPickingOnMap] = useState(false);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState("");
  const [savedPlaces, setSavedPlaces] = useState({ home: null, office: null });

  // Load saved Home/Office addresses so they can be quick-selected below
  useEffect(() => {
    if (!token) return;
    getProfile(token)
      .then((data) => {
        setSavedPlaces({
          home: data.home?.lat != null ? data.home : null,
          office: data.office?.lat != null ? data.office : null,
        });
      })
      .catch(() => setSavedPlaces({ home: null, office: null }));
  }, [token]);

  const handleDestinationPicked = ({ lat, lon, label }) => {
    setDestination(label);
    setDestinationCoords({ lat, lon });
    setPickingOnMap(false);
  };

  const handleQuickSelect = (place) => {
    if (!place) return;
    handleDestinationPicked({ lat: place.lat, lon: place.lon, label: place.label });
  };

  const handleStart = async () => {
    if (!destination) {
      setError("Please choose a destination first.");
      return;
    }

    setError("");
    setStarting(true);
    try {
      const walk = await startWalk(
        {
          destination,
          destinationLat: destinationCoords?.lat ?? null,
          destinationLon: destinationCoords?.lon ?? null,
          source,
          eta,
          currentLat: currentPosition?.lat ?? null,
          currentLon: currentPosition?.lon ?? null,
        },
        token
      );

      setWalkId(walk._id);
      setShareToken(walk.shareToken);
      setTracking(true);
      setStartTime(new Date());
    } catch (err) {
      setError(err.message || "Could not start walk. Is the backend running?");
    } finally {
      setStarting(false);
    }
  };

  const handleStop = async () => {
    setStopping(true);
    try {
      if (walkId) {
        const durationMin = startTime
          ? Math.max(1, Math.round((new Date() - new Date(startTime)) / 60000))
          : 0;

        await finishWalk(
          walkId,
          { status: "Safe", duration: `${durationMin} min` },
          token
        );
      }
    } catch (err) {
      setError(err.message || "Could not save walk completion.");
    } finally {
      setTracking(false);
      setStopping(false);
    }
  };

  const shareLink = shareToken ? `${window.location.origin}/track/${shareToken}` : null;
  const shareMessage = shareLink
    ? `📍 ${user?.name || "I"} am walking to ${destination || "my destination"}. Track my live location here: ${shareLink}`
    : "";

  return (
    <div className="flex bg-[#0F0F10] min-h-screen text-white">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-8">
          Start Walk
        </h1>

        <div className="bg-[#171717] rounded-3xl p-8">

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* Destination */}
          <div className="mb-6">
            <label className="block mb-2 text-gray-400">
              Destination
            </label>

            {(savedPlaces.home || savedPlaces.office) && (
              <div className="flex gap-3 mb-3">
                {savedPlaces.home && (
                  <button
                    type="button"
                    onClick={() => handleQuickSelect(savedPlaces.home)}
                    className="flex items-center gap-2 bg-[#222] hover:bg-[#2a2a2a] px-4 py-2 rounded-xl text-sm"
                  >
                    🏠 Home
                  </button>
                )}
                {savedPlaces.office && (
                  <button
                    type="button"
                    onClick={() => handleQuickSelect(savedPlaces.office)}
                    className="flex items-center gap-2 bg-[#222] hover:bg-[#2a2a2a] px-4 py-2 rounded-xl text-sm"
                  >
                    🏢 Office
                  </button>
                )}
              </div>
            )}
            {!savedPlaces.home && !savedPlaces.office && (
              <p className="text-gray-500 text-xs mb-3">
                Tip: save a Home/Office address in Profile to quick-select it here next time.
              </p>
            )}

            <DestinationSearch
              onPickOnMap={() => setPickingOnMap((prev) => !prev)}
              pickingOnMap={pickingOnMap}
            />
            {pickingOnMap && (
              <p className="text-blue-400 text-sm mt-2">
                Tap anywhere on the map below to drop your destination pin.
              </p>
            )}
          </div>

          {/* ETA */}
          <div className="mb-6">
            <label className="block mb-2 text-gray-400">
              Expected Arrival Time
            </label>

            <input
              type="time"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="w-full bg-[#222] p-4 rounded-xl outline-none"
            />
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">

            <div className="bg-[#222] p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-3">
                📍 Current Location
              </h2>

              <p className="text-gray-400">
                {source || "Detecting your location..."}
              </p>
            </div>

            <div className="bg-[#222] p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-3">
                🚶 Status
              </h2>

              <p className="text-green-500">
                {tracking ? "Tracking..." : "Ready to Start"}
              </p>
            </div>

          </div>

          {/* Map */}
          <div className="bg-[#222] rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              📍 Live Tracking Map
            </h2>

            <MapComponent
              pickingOnMap={pickingOnMap}
              onDestinationPicked={handleDestinationPicked}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">

            <button
              onClick={handleStart}
              disabled={tracking || starting}
              className="bg-green-600 px-8 py-4 rounded-xl font-bold hover:bg-green-700 disabled:opacity-40"
            >
              {starting ? "Starting..." : "Start Tracking"}
            </button>

            <button
              onClick={handleStop}
              disabled={!tracking || stopping}
              className="bg-red-600 px-8 py-4 rounded-xl font-bold hover:bg-red-700 disabled:opacity-40"
            >
              {stopping ? "Saving..." : "Stop Tracking (Reached Safely)"}
            </button>

            {shareLink && (
              <WhatsAppShareButton
                message={shareMessage}
                label="Share Live Location"
              />
            )}

          </div>

          {shareLink && (
            <p className="text-gray-500 text-xs mt-3 break-all">
              Anyone with this link can watch your live location: {shareLink}
            </p>
          )}

          {/* Journey Details */}
          <div className="mt-8 bg-[#222] p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">
              Journey Details
            </h2>

            <p className="text-gray-400">
              Destination: {destination || "Not Selected"}
            </p>

            <p className="text-gray-400 mt-2">
              ETA: {eta || "Not Selected"}
            </p>

            <p className="text-green-500 mt-2">
              {tracking ? "🚶 Tracking..." : "⏹ Not Started"}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default StartWalk;
