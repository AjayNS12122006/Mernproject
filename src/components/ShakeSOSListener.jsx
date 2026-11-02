import { useEffect, useRef, useContext, useState } from "react";
import { WalkContext } from "../context/WalkContext";

const SHAKE_THRESHOLD = 18; // acceleration delta needed to count as a shake
const SHAKE_COOLDOWN_MS = 4000;

function ShakeSOSListener() {
  const { setShowSOS, setSosAutoTrigger } = useContext(WalkContext);
  const lastValuesRef = useRef({ x: 0, y: 0, z: 0 });
  const lastShakeRef = useRef(0);
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem("shakeSOSEnabled") === "true"
  );

  // Settings page dispatches this event when the toggle changes, so this
  // listener updates immediately without needing a page reload.
  useEffect(() => {
    const handleChange = () => {
      setEnabled(localStorage.getItem("shakeSOSEnabled") === "true");
    };
    window.addEventListener("shakeSOSSettingChanged", handleChange);
    return () => window.removeEventListener("shakeSOSSettingChanged", handleChange);
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.DeviceMotionEvent) return;

    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const { x = 0, y = 0, z = 0 } = acc;
      const last = lastValuesRef.current;

      const delta =
        Math.abs(x - last.x) + Math.abs(y - last.y) + Math.abs(z - last.z);

      lastValuesRef.current = { x, y, z };

      const now = Date.now();
      if (delta > SHAKE_THRESHOLD && now - lastShakeRef.current > SHAKE_COOLDOWN_MS) {
        lastShakeRef.current = now;
        setSosAutoTrigger(false); // manual confirm — avoids false-positive auto-send
        setShowSOS(true);
      }
    };

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [enabled, setShowSOS, setSosAutoTrigger]);

  return null;
}

export default ShakeSOSListener;
