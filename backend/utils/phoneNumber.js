import { parsePhoneNumberFromString } from "libphonenumber-js";

export function normalizePhoneNumber(phone) {
  if (typeof phone !== "string" || !phone.trim()) return null;

  try {
    const value = phone.trim();
    const parsed = parsePhoneNumberFromString(
      value,
      value.startsWith("+") ? undefined : "IN"
    );
    return parsed?.isValid() ? parsed.number : null;
  } catch {
    return null;
  }
}