import { openWhatsApp } from "../utils/whatsapp";

function WhatsAppShareButton({ message, phone, label = "Share via WhatsApp", className = "" }) {
  return (
    <button
      type="button"
      onClick={() => openWhatsApp(message, phone)}
      className={
        className ||
        "flex items-center justify-center gap-2 bg-[#25D366] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#20bd5a] transition"
      }
    >
      <span>💬</span> {label}
    </button>
  );
}

export default WhatsAppShareButton;
