import { useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FakeCallModal from "./FakeCallModal";

function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [fakeCallActive, setFakeCallActive] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const timeoutRef = useRef(null);

  const linkStyle = ({ isActive }) =>
    `block px-4 py-3 rounded-xl transition ${
      isActive
        ? "bg-[#222] text-green-500 font-semibold"
        : "text-gray-300 hover:bg-[#222] hover:text-green-500"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const scheduleFakeCall = () => {
    setScheduling(true);
    timeoutRef.current = setTimeout(() => {
      setScheduling(false);
      setFakeCallActive(true);
    }, 10000);
  };

  return (
    <div className="bg-[#171717] w-64 min-h-screen p-6 flex flex-col">
      <h1 className="text-2xl font-bold text-green-500 mb-2">
        SafetyWalk
      </h1>

      {user?.name && (
        <p className="text-gray-500 text-sm mb-8">Hi, {user.name}</p>
      )}

      <nav className="space-y-3 flex-1">
        <NavLink to="/dashboard" className={linkStyle}>
          🏠 Dashboard
        </NavLink>

        <NavLink to="/start-walk" className={linkStyle}>
          🚶 Start Walk
        </NavLink>

        <NavLink to="/contacts" className={linkStyle}>
          👨‍👩‍👧 Contacts
        </NavLink>

        <NavLink to="/history" className={linkStyle}>
          📜 History
        </NavLink>

        <NavLink to="/profile" className={linkStyle}>
          👤 Profile
        </NavLink>

        <NavLink to="/settings" className={linkStyle}>
          ⚙ Settings
        </NavLink>
      </nav>

      <button
        onClick={scheduleFakeCall}
        disabled={scheduling}
        title="Get a fake incoming call in 10 seconds — a quick way to exit an uncomfortable situation"
        className="mb-3 px-4 py-3 rounded-xl text-blue-400 hover:bg-blue-500/10 text-left disabled:opacity-50"
      >
        {scheduling ? "📞 Ringing in 10s..." : "📞 Fake Call"}
      </button>

      <button
        onClick={handleLogout}
        className="px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 text-left"
      >
        🚪 Logout
      </button>

      {fakeCallActive && (
        <FakeCallModal
          isOpen={true}
          onClose={() => setFakeCallActive(false)}
        />
      )}
    </div>
  );
}

export default Sidebar;
