import nodemailer from "nodemailer";
import twilio from "twilio";

// --- Email setup (Nodemailer) ---
// Works with Gmail (use an App Password, not your normal password) or any SMTP provider.
let mailTransporter = null;

function getMailTransporter() {
  if (mailTransporter) return mailTransporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  try {
    if (process.env.EMAIL_SERVICE) {
      // e.g. EMAIL_SERVICE=gmail
      mailTransporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else if (process.env.EMAIL_HOST) {
      // Generic SMTP provider
      mailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      return null;
    }
  } catch {
    return null;
  }

  return mailTransporter;
}

// --- SMS setup (Twilio) ---
let twilioClient = null;

function getTwilioClient() {
  if (twilioClient) return twilioClient;

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !authToken || !sid.startsWith("AC")) {
    return null;
  }

  try {
    twilioClient = twilio(sid, authToken);
  } catch {
    return null;
  }

  return twilioClient;
}

function buildAlertMessage({ userName, destination, source }) {
  const dest = destination || "an unknown destination";
  const from = source ? ` from ${source}` : "";

  return (
    `🚨 SOS ALERT: ${userName || "Your contact"} has triggered an emergency ` +
    `alert while walking${from} to ${dest}. Please check on them immediately.`
  );
}

async function sendEmailAlert(contact, message, userName) {
  const transporter = getMailTransporter();

  if (!transporter || !contact.email) {
    return { channel: "email", contact: contact.name, sent: false, reason: !transporter ? "Email not configured" : "Contact has no email" };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: contact.email,
      subject: `🚨 SOS Alert from ${userName || "Safety Walk Companion"}`,
      text: message,
    });
    return { channel: "email", contact: contact.name, sent: true };
  } catch (error) {
    return { channel: "email", contact: contact.name, sent: false, reason: error.message };
  }
}


// Email-only SOS delivery. WhatsApp remains a manual user action in the frontend.
export async function sendSOSEmailAlerts({
  user,
  contacts,
  destination,
  source,
  locationUrl,
  trackingUrl,
  timestamp,
}) {
  const messageParts = [
    `🚨 SOS ALERT: ${user?.name || "Your trusted contact"} may need help.`,
    `Destination: ${destination || "Unknown"}`,
    `Starting point: ${source || "Unknown"}`,
    `Last known location: ${locationUrl || "Unavailable"}`,
    `Live tracking: ${trackingUrl || "Unavailable"}`,
    `Time: ${timestamp || new Date().toLocaleString()}`,
    "",
    "Please try to contact them immediately. If you believe they are in immediate danger and cannot reach them, contact local emergency services.",
  ];
  const message = messageParts.join("\n");

  // Do not send SMS here: WhatsApp is intentionally still opened for the user
  // to review recipients and press Send manually.
  return Promise.all(
    (contacts || []).map((contact) =>
      sendEmailAlert(
        contact,
        message,
        user?.name || "Safety Walk Companion"
      )
    )
  );
}

async function sendSmsAlert(contact, message) {
  const client = getTwilioClient();

  if (!client || !contact.phone || !process.env.TWILIO_PHONE_NUMBER) {
    return { channel: "sms", contact: contact.name, sent: false, reason: !client ? "SMS not configured" : "Missing phone number" };
  }

  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: contact.phone,
    });
    return { channel: "sms", contact: contact.name, sent: true };
  } catch (error) {
    return { channel: "sms", contact: contact.name, sent: false, reason: error.message };
  }
}

// Sends both email + SMS to every contact that has the relevant info,
// and never throws — always resolves with a per-contact/channel report.
export async function sendSOSAlerts({ user, contacts, destination, source }) {
  const message = buildAlertMessage({ userName: user?.name, destination, source });

  const safe = (promise, channel, contact) =>
    promise.catch((error) => ({
      channel,
      contact: contact.name,
      sent: false,
      reason: error.message,
    }));

  const jobs = contacts.flatMap((contact) => [
    safe(sendEmailAlert(contact, message, user?.name), "email", contact),
    safe(sendSmsAlert(contact, message), "sms", contact),
  ]);

  const results = await Promise.all(jobs);
  return results;
}
