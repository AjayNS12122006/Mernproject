import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { getWalks } from "../api";

function History() {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getWalks(token);
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadHistory();
  }, [token]);

  return (
    <div className="flex bg-[#0F0F10] min-h-screen text-white">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-8">
          Walk History
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : history.length === 0 ? (
            <div className="bg-[#171717] rounded-3xl p-6">
              <h2 className="text-2xl font-bold">
                No Walk History Yet
              </h2>

              <p className="text-gray-400 mt-4">
                Complete a walk and press "Reached Safely" to save it here.
              </p>
            </div>
          ) : (
            history.map((walk) => (
              <div
                key={walk._id}
                className="bg-[#171717] rounded-3xl p-6"
              >
                <h2 className="text-2xl font-bold">
                  {new Date(walk.createdAt).toLocaleDateString()}
                </h2>

                <div className="mt-4 text-gray-400 space-y-2">
                  <p>📍 Route : {walk.source ? `${walk.source} → ` : ""}{walk.destination}</p>
                  <p>⏱ Duration : {walk.duration}</p>
                  <p
                    className={
                      walk.status === "SOS"
                        ? "text-red-500"
                        : walk.status === "Ongoing"
                        ? "text-blue-400"
                        : "text-green-500"
                    }
                  >
                    {walk.status === "SOS" ? "🚨" : walk.status === "Ongoing" ? "🕓" : "✅"} Status : {walk.status}
                  </p>
                </div>
              </div>
            ))
          )}

        </div>
      </div>
    </div>
  );
}

export default History;
