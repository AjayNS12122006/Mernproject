import { useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import StartWalk from "./pages/StartWalk";
import Contacts from "./pages/Contacts";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TrackWalk from "./pages/TrackWalk";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import SOSModal from "./components/SOSModal";
import ShakeSOSListener from "./components/ShakeSOSListener";
import { WalkContext } from "./context/WalkContext";

function App() {
  const { showSOS, setShowSOS, sosAutoTrigger, setSosAutoTrigger, destination, source } =
    useContext(WalkContext);

  const handleCloseSOS = () => {
    setShowSOS(false);
    setSosAutoTrigger(false);
  };

  return (
    <BrowserRouter>
      <ShakeSOSListener />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/track/:shareToken" element={<TrackWalk />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/start-walk" element={<ProtectedRoute><StartWalk /></ProtectedRoute>} />
        <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Rendered once, globally, so a missed-ETA SOS shows up no matter which page you're on.
          Mounted only while open so its internal state resets cleanly each time. */}
      {showSOS && (
        <SOSModal
          isOpen={showSOS}
          onClose={handleCloseSOS}
          destination={destination}
          source={source}
          autoTrigger={sosAutoTrigger}
        />
      )}
    </BrowserRouter>
  );
}

export default App;
