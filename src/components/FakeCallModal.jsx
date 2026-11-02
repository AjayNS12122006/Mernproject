import { useEffect, useRef, useState } from "react";

// Generates a simple ringtone using the Web Audio API — no external
// audio file needed (keeps this copyright-safe and dependency-free).
function useRingtone(playing) {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!playing) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();

    const playTone = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1);
    };

    playTone();
    intervalRef.current = setInterval(playTone, 1500);

    return () => {
      clearInterval(intervalRef.current);
      ctx.close();
    };
  }, [playing]);
}

function FakeCallModal({ isOpen, onClose, callerName = "Mom" }) {
  const [phase, setPhase] = useState("ringing"); // ringing -> active
  const [seconds, setSeconds] = useState(0);

  useRingtone(isOpen && phase === "ringing");

  useEffect(() => {
    if (phase !== "active") return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  if (!isOpen) return null;

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-white flex flex-col items-center justify-between py-16">
      <div className="text-center mt-10">
        <p className="text-gray-400 text-lg mb-2">
          {phase === "ringing" ? "Incoming call" : "Connected"}
        </p>
        <h1 className="text-4xl font-bold">{callerName}</h1>
        {phase === "active" && (
          <p className="text-gray-500 mt-3">{formatTime(seconds)}</p>
        )}
      </div>

      <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center text-5xl">
        👤
      </div>

      {phase === "ringing" ? (
        <div className="flex gap-16">
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onClose}
              className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-2xl"
            >
              ✕
            </button>
            <span className="text-sm text-gray-400">Decline</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setPhase("active")}
              className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-2xl"
            >
              📞
            </button>
            <span className="text-sm text-gray-400">Accept</span>
          </div>
        </div>
      ) : (
        <button
          onClick={onClose}
          className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-2xl"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default FakeCallModal;
