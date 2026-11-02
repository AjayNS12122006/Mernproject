import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [shakeEnabled, setShakeEnabled] = useState(
    () => localStorage.getItem("shakeSOSEnabled") === "true"
  );
  const [permissionMessage, setPermissionMessage] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleToggleShake = async () => {
    const turningOn = !shakeEnabled;

    if (turningOn && typeof window.DeviceMotionEvent?.requestPermission === "function") {
      // iOS 13+ requires an explicit permission prompt triggered by a user gesture
      try {
        const result = await window.DeviceMotionEvent.requestPermission();
        if (result !== "granted") {
          setPermissionMessage("Motion permission was denied — Shake-to-SOS can't be enabled.");
          return;
        }
      } catch {
        setPermissionMessage("Could not request motion permission on this device.");
        return;
      }
    }

    setPermissionMessage("");
    localStorage.setItem("shakeSOSEnabled", turningOn ? "true" : "false");
    window.dispatchEvent(new Event("shakeSOSSettingChanged"));
    setShakeEnabled(turningOn);
  };

  return (
    <div className="flex bg-[#0F0F10] min-h-screen text-white">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-8">
          Settings
        </h1>

        <div className="bg-[#171717] rounded-3xl p-8 max-w-3xl">

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              🔔 Notifications
            </h2>
            <p className="text-gray-400">
              Enable SOS alerts and push notifications.
            </p>
          </div>

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                📳 Shake-to-SOS
              </h2>
              <p className="text-gray-400 max-w-md">
                Shake your phone firmly to instantly bring up the SOS confirmation screen — useful when you can't safely look at or tap through your screen. This is a device-only setting.
              </p>
              {permissionMessage && (
                <p className="text-red-400 text-sm mt-2">{permissionMessage}</p>
              )}
            </div>

            <button
              onClick={handleToggleShake}
              className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap ${
                shakeEnabled ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {shakeEnabled ? "Enabled" : "Enable"}
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              📍 Location Sharing
            </h2>
            <p className="text-gray-400">
              Share live location with trusted contacts.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              🌙 Theme
            </h2>
            <p className="text-gray-400">
              Dark Mode Enabled
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">
              🔒 Privacy
            </h2>
            <p className="text-gray-400">
              Only trusted contacts can view your journey.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 px-8 py-4 rounded-xl font-bold hover:bg-red-700"
          >
            Logout
          </button>

        </div>
      </div>
    </div>
  );
}

export default Settings;
