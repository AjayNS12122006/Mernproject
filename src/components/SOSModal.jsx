import { useState, useContext, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { WalkContext } from "../context/WalkContext";
import { startWalk, sendWalkSOS } from "../api";
import { openWhatsAppInWindow } from "../utils/whatsapp";

const AUTO_SEND_SECONDS = 15;

function SOSModal({ isOpen, onClose, destination, source, autoTrigger = false }) {
  const { token, user } = useAuth();
  const {
    walkId,
    shareToken,
    setWalkId,
    setShareToken,
    destinationCoords,
    currentPosition,
  } = useContext(WalkContext);

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // { message, shareToken }
  const [whatsappBlocked, setWhatsappBlocked] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(() => (autoTrigger ? AUTO_SEND_SECONDS : null));
  const hasSentRef = useRef(false);

  const handleSendAlert = async () => {
    if (hasSentRef.current) return;
    hasSentRef.current = true;
    const whatsappWindow = window.open("about:blank", "_blank");

    setSending(true);
    setError("");
    try {
      let activeWalkId = walkId;
      let activeShareToken = shareToken;

      // If there's no walk in progress (e.g. SOS pressed straight from Dashboard
      // with no active tracked walk), create one on the fly so we still have
      // something to mark as SOS and a link to share.
      if (!activeWalkId) {
        const newWalk = await startWalk(
          {
            destination: destination || "Unknown",
            destinationLat: destinationCoords?.lat ?? null,
            destinationLon: destinationCoords?.lon ?? null,
            source: source || "",
            currentLat: currentPosition?.lat ?? null,
            currentLon: currentPosition?.lon ?? null,
          },
          token
        );
        activeWalkId = newWalk._id;
        activeShareToken = newWalk.shareToken;
        setWalkId(activeWalkId);
        setShareToken(activeShareToken);
      }

      const response = await sendWalkSOS(
        activeWalkId,
        {
          lat: currentPosition?.lat ?? null,
          lon: currentPosition?.lon ?? null,
        },
        token
      );
      activeShareToken = response.shareToken || activeShareToken;
      const trackingUrl = `${window.location.origin}/track/${activeShareToken}`;
      const latitude = response.currentLat ?? currentPosition?.lat;
      const longitude = response.currentLon ?? currentPosition?.lon;
      const locationUrl = latitude != null && longitude != null
        ? `https://maps.google.com/?q=${latitude},${longitude}`
        : "Unavailable";
      const message = [
        `Emergency SOS: ${user?.name || "I"} need help.`,
        `Destination: ${destination || "Unknown"}`,
        `Starting point: ${source || "Unknown"}`,
        `Last known location: ${locationUrl}`,
        `Live tracking: ${trackingUrl}`,
        `Time: ${new Date().toLocaleString()}`,
      ].join("\n");

      const openedWhatsApp = openWhatsAppInWindow(message, whatsappWindow);
      setResult({
        message,
        shareToken: activeShareToken,
      });
      setWhatsappBlocked(!openedWhatsApp);
    } catch (err) {
      whatsappWindow?.close();
      setError(err.message || "Could not send the emergency alert.");
      hasSentRef.current = false;
    } finally {
      setSending(false);
    }
  };

  // Countdown ticker for the auto-trigger (missed-ETA) case
  useEffect(() => {
    if (!isOpen || !autoTrigger || result || countdown === null) return;

    if (countdown <= 0) return;

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [isOpen, autoTrigger, result, countdown]);

  if (!isOpen) return null;

  const trackingLink = result?.shareToken
    ? `${window.location.origin}/track/${result.shareToken}`
    : null;

  const handleClose = () => {
    setResult(null);
    setWhatsappBlocked(false);
    setError("");
    setCountdown(null);
    onClose();
  };

  const handleImSafe = () => {
    // Cancels the auto-send — the person confirmed they're fine.
    hasSentRef.current = true; // block any in-flight timer from firing
    setCountdown(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#171717] border border-gray-700 rounded-3xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">

        <h1 className="text-3xl font-bold text-red-500 mb-4">
          ⚠ Emergency Alert
        </h1>

        {error ? (
          <div>
            <p className="text-red-300 mb-3">The alert could not be sent: {error}</p>
            <p className="text-gray-300 mb-5">
              Please call your local emergency number directly. In India, call 112.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleSendAlert({ retry: true })}
                disabled={sending}
                className="flex-1 bg-red-600 py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50"
              >
                {sending ? "Retrying..." : "Retry Alert"}
              </button>
              <a
                href="tel:112"
                className="flex-1 text-center bg-gray-700 py-3 rounded-xl font-bold hover:bg-gray-600"
              >
                Call 112
              </a>
            </div>
          </div>
        ) : !result ? (
          <>
            {autoTrigger && countdown > 0 ? (
              <>
                <p className="text-gray-300 mb-2">
                  You haven't confirmed reaching your destination by your ETA.
                </p>
                <p className="text-gray-400 mb-6 text-sm">
                  You can cancel if safe. Otherwise, choose who to alert in WhatsApp after:
                </p>

                <div className="text-center mb-8">
                  <span className="text-6xl font-bold text-red-500">{countdown}</span>
                  <span className="text-gray-500 text-xl">s</span>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleImSafe}
                    className="flex-1 bg-green-600 py-3 rounded-xl font-bold hover:bg-green-700"
                  >
                    ✅ I'm Safe — Cancel
                  </button>

                  <button
                    onClick={handleSendAlert}
                    disabled={sending}
                    className="flex-1 bg-red-600 py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send Now"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-400 mb-8">
                  WhatsApp will open with your SOS details. Choose the contact or contacts there, then tap Send.
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={handleSendAlert}
                    disabled={sending}
                    className="flex-1 bg-red-600 py-3 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50"
                  >
                    {sending ? "Preparing..." : "Send via WhatsApp"}
                  </button>

                  <button
                    onClick={handleClose}
                    disabled={sending}
                    className="flex-1 bg-gray-700 py-3 rounded-xl font-bold hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <p className="text-gray-300 mb-4">
              SOS details are ready. Choose your contact or contacts in WhatsApp and tap Send to alert them.
            </p>

            <pre className="mb-4 whitespace-pre-wrap break-words rounded-xl bg-[#222] p-3 text-sm text-gray-300">
              {result.message}
            </pre>

            <button
              onClick={() => openWhatsAppInWindow(result.message)}
              className="w-full bg-[#25D366] text-black py-3 rounded-xl font-bold hover:bg-[#20bd5a] mb-3"
            >
              {whatsappBlocked ? "Open WhatsApp" : "Choose Contacts in WhatsApp"}
            </button>

            {trackingLink && (
              <div className="mb-4 bg-[#222] rounded-xl p-3 text-xs text-gray-400 break-all">
                Live tracking link: <span className="text-blue-400">{trackingLink}</span>
              </div>
            )}

            <button
              onClick={handleClose}
              className="w-full bg-gray-700 py-3 rounded-xl font-bold hover:bg-gray-600"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default SOSModal;
