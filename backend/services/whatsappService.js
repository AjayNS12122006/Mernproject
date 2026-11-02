import twilio from "twilio";

let client;

function getTwilioClient() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error("Twilio credentials are not configured");
  }

  if (!client) client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return client;
}

function whatsappAddress(address) {
  return address.startsWith("whatsapp:") ? address : `whatsapp:${address}`;
}

async function sendWhatsApp({ to, message, templateVariables }) {
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!from) throw new Error("Twilio WhatsApp sender is not configured");

  const payload = {
    from: whatsappAddress(from),
    to: whatsappAddress(to),
  };

  if (process.env.TWILIO_WHATSAPP_TEMPLATE_SID) {
    // The approved Twilio Content template must map {{1}}-{{4}} to these values.
    payload.contentSid = process.env.TWILIO_WHATSAPP_TEMPLATE_SID;
    payload.contentVariables = JSON.stringify(templateVariables);
  } else {
    payload.body = message;
  }

  await getTwilioClient().messages.create(payload);
}

async function sendSms({ to, message }) {
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) throw new Error("Twilio SMS sender is not configured");

  await getTwilioClient().messages.create({ from, to, body: message });
}

export async function sendSOSMessage({ to, message, templateVariables }) {
  try {
    await sendWhatsApp({ to, message, templateVariables });
    return { channel: "whatsapp" };
  } catch (whatsappError) {
    console.warn("[SOS] WhatsApp delivery failed; trying SMS fallback", {
      reason: whatsappError.message,
      timestamp: new Date().toISOString(),
    });

    try {
      await sendSms({ to, message });
      return { channel: "sms" };
    } catch (smsError) {
      throw new Error(
        `WhatsApp failed: ${whatsappError.message}; SMS fallback failed: ${smsError.message}`,
        { cause: smsError }
      );
    }
  }
}