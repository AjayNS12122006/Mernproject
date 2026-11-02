// Opens WhatsApp (app or web) with a pre-filled message.
// No WhatsApp Business API needed — this uses WhatsApp's public "click to chat" link,
// so the user still taps Send themselves inside WhatsApp.
export function openWhatsApp(message, phone) {
  const encoded = encodeURIComponent(message);
  const cleanPhone = phone ? phone.replace(/[^\d+]/g, "").replace("+", "") : "";
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.open(url, "_blank");
}

export function openWhatsAppInWindow(message, targetWindow) {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/?text=${encoded}`;

  if (targetWindow) {
    targetWindow.location.href = url;
    return true;
  }

  return Boolean(window.open(url, "_blank"));
}
