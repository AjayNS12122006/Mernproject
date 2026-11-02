import { useContext, useState, useEffect } from "react";
import { WalkContext } from "../context/WalkContext";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import WhatsAppShareButton from "../components/WhatsAppShareButton";
import { getWalks, finishWalk } from "../api";

function Dashboard() {
  const { token, user } = useAuth();

  const {
    destination,
    eta,
    tracking,
    setTracking,
    startTime,
    walkId,
    shareToken,
    setShowSOS,
    setSosAutoTrigger,
  } = useContext(WalkContext);

  const [recentWalks, setRecentWalks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    const loadWalks = async () => {
      try {
        const data = await getWalks(token);
        setRecentWalks(data.slice(0, 5));
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadWalks();
  }, [token]);

  const getDuration = () => {
    if (!startTime) return "0 min";
    const diff = Math.max(1, Math.floor((new Date() - new Date(startTime)) / 60000));
    return `${diff} min`;
  };

  const handleReachedSafely = async () => {
    if (!walkId) return;

    setFinishing(true);
    try {
      const updatedWalk = await finishWalk(
        walkId,
        { status: "Safe", duration: getDuration() },
        token
      );

      setRecentWalks([updatedWalk, ...recentWalks].slice(0, 5));
      setTracking(false);
      alert("Journey completed successfully!");
    } catch (err) {
      alert(err.message || "Could not save walk. Is the backend running?");
    } finally {
      setFinishing(false);
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
          Welcome{user?.name ? `, ${user.name}` : ""}
        </h1>

        {/* Top Cards */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Current Walk */}
          <div className="bg-[#171717] rounded-3xl p-6">
            <h2 className="text-2xl font-bold">
              Current Walk
            </h2>

            <div className="mt-4 space-y-3 text-gray-300">

              <p>
                📍 Destination : {destination || "Not Selected"}
              </p>

              <p>
                ⏰ ETA : {eta || "Not Selected"}
              </p>

              <p className="text-green-500">
                🚶 Status : {tracking ? "Tracking..." : "Not Started"}
              </p>

              {shareLink && tracking && (
                <div className="pt-2">
                  <WhatsAppShareButton
                    message={shareMessage}
                    label="Share Live Location"
                    className="text-sm bg-[#25D366] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#20bd5a] inline-flex items-center gap-2"
                  />
                </div>
              )}

            </div>
          </div>

          {/* Trusted Contacts */}
          <div className="bg-[#171717] rounded-3xl p-6">
            <h2 className="text-2xl font-bold">
              Trusted Contacts
            </h2>

            <p className="text-gray-400 mt-4 text-sm">
              Manage who gets alerted in the Contacts page.
            </p>
          </div>

          {/* Emergency Buttons */}
          <div className="bg-[#171717] rounded-3xl p-6">

            <button
              onClick={() => {
                setSosAutoTrigger(false);
                setShowSOS(true);
              }}
              className="w-full bg-red-600 py-4 rounded-xl font-bold hover:bg-red-700 duration-300"
            >
              🚨 SOS
            </button>

            <button
              onClick={handleReachedSafely}
              disabled={!tracking || !walkId || finishing}
              className="w-full bg-green-600 py-4 rounded-xl font-bold mt-4 hover:bg-green-700 duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {finishing ? "Saving..." : "✅ Reached Safely"}
            </button>

          </div>

        </div>

        {/* Recent Walks */}
        <div className="bg-[#171717] rounded-3xl p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">
            📜 Recent Walks
          </h2>

          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : recentWalks.length === 0 ? (
              <p className="text-gray-400">No walks yet. Start one from "Start Walk".</p>
            ) : (
              recentWalks.map((walk) => (
                <div key={walk._id} className="bg-[#222] p-4 rounded-xl flex justify-between">
                  <span>{walk.source || "Start"} → {walk.destination}</span>
                  <span
                    className={
                      walk.status === "SOS"
                        ? "text-red-500"
                        : walk.status === "Ongoing"
                        ? "text-blue-400"
                        : "text-green-500"
                    }
                  >
                    {walk.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
