import { useState, useEffect, useRef } from "react";

const CALLER_NAMES = ["Mom", "Dad", "Roommate", "Best Friend"];

function FakeCallButton() {
  const [scheduled, setScheduled] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [callerName, setCallerName] = useState("Mom");
  const [seconds, setSeconds] = useState(0);
  const timeoutRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  const scheduleCall = (delaySeconds, name) => {
    setCallerName(name);
    setScheduled(true);
    timeoutRef.current = setTimeout(() => {
      setScheduled(false);
      setRinging(true);
      if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
    }, delaySeconds * 1000);
  };

  const cancelScheduled = () => {
    clearTimeout(timeoutRef.current);
    setScheduled(false);
  };

  const answerCall = () => {
    setRinging(false);
    setAnswered(true);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const declineCall = () => {
    setRinging(false);
  };

  const endCall = () => {
    clearInterval(timerRef.current);
    setAnswered(false);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Full-screen fake call UI, mimics an actual incoming/ongoing call
  if (ringing || answered) {
    return (
      <div className="fixed inset-0 z-[10000] bg-gradient-to-b from-[#1c1c2e] to-[#0F0F10] text-white flex flex-col items-center justify-between py-16">
        <div className="text-center mt-10">
          <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center text-5xl mx-auto mb-6">
            👤
          </div>
          <h1 className="text-3xl font-bold">{callerName}</h1>
          <p className="text-gray-400 mt-2">
            {answered ? formatTime(seconds) : "mobile · incoming call..."}
          </p>
        </div>

        {ringing && !answered && (
          <div className="flex gap-16">
            <button
              onClick={declineCall}
              className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-2xl shadow-lg hover:bg-red-700"
              title="Decline"
            >
              📵
            </button>
            <button
              onClick={answerCall}
              className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-2xl shadow-lg hover:bg-green-700"
              title="Answer"
            >
              📞
            </button>
          </div>
        )}

        {answered && (
          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-2xl shadow-lg hover:bg-red-700"
            title="End call"
          >
            📵
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#171717] rounded-3xl p-6">
      <h2 className="text-xl font-bold mb-2">🎭 Fake Call</h2>
      <p className="text-gray-400 text-sm mb-4">
        Feeling uneasy? Schedule a fake incoming call to give yourself a reason to leave or get help nearby.
      </p>

      {scheduled ? (
        <button
          onClick={cancelScheduled}
          className="w-full bg-gray-700 py-3 rounded-xl font-bold hover:bg-gray-600"
        >
          Cancel scheduled call
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {[5, 15, 30].map((delay) => (
            <button
              key={delay}
              onClick={() => scheduleCall(delay, CALLER_NAMES[Math.floor(Math.random() * CALLER_NAMES.length)])}
              className="bg-[#222] hover:bg-[#2a2a2a] py-3 rounded-xl text-sm font-semibold"
            >
              in {delay}s
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FakeCallButton;
