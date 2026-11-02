import { createContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { updateWalkLocation } from "../api";

export const WalkContext = createContext();

export function WalkProvider({ children }) {
  const { token } = useAuth();

  const [destination, setDestination] = useState("");
  const [destinationCoords, setDestinationCoords] = useState(null); // { lat, lon }
  const [eta, setEta] = useState("");
  const [tracking, setTracking] = useState(false);

  const [startTime, setStartTime] = useState(null);
  const [showSOS, setShowSOS] = useState(false);
  const [sosAutoTrigger, setSosAutoTrigger] = useState(false);
  const [path, setPath] = useState([]);
  const [distance, setDistance] = useState(0);
  const [source, setSource] = useState("");
  const [walkId, setWalkId] = useState(null);
  const [shareToken, setShareToken] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null); // { lat, lon }

  // App-wide ETA watcher — runs no matter which page is open, so a missed
  // ETA still triggers SOS even if you've navigated away from Start Walk.
  useEffect(() => {
    if (!tracking || !eta || showSOS) return;

    const interval = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = eta.split(":");
      const etaTime = new Date();
      etaTime.setHours(Number(hours));
      etaTime.setMinutes(Number(minutes));
      etaTime.setSeconds(0);

      if (now >= etaTime) {
        setSosAutoTrigger(true);
        setShowSOS(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [tracking, eta, showSOS]);

  // App-wide live-location push — keeps the shared WhatsApp tracking link
  // updated even if you've navigated away from Start Walk.
  useEffect(() => {
    if (!tracking || !walkId || !currentPosition) return;

    const interval = setInterval(() => {
      updateWalkLocation(
        walkId,
        { lat: currentPosition.lat, lon: currentPosition.lon },
        token
      ).catch(() => {
        // Non-fatal — just skip this update, the next tick will retry.
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [tracking, walkId, currentPosition, token]);

  return (
    <WalkContext.Provider
      value={{
        destination,
        setDestination,
        destinationCoords,
        setDestinationCoords,
        eta,
        setEta,
        tracking,
        setTracking,
        startTime,
        setStartTime,
        showSOS,
        setShowSOS,
        sosAutoTrigger,
        setSosAutoTrigger,
        path,
        setPath,
        distance,
        setDistance,
        source,
        setSource,
        walkId,
        setWalkId,
        shareToken,
        setShareToken,
        currentPosition,
        setCurrentPosition,
      }}
    >
      {children}
    </WalkContext.Provider>
  );
}
