// Decides whether a string is a URL we will shorten. Kept separate so the rule
// is easy to find and reason about.

const ALLOWED_PROTOCOLS = ["http:", "https:"];
const MAX_URL_LENGTH = 2048; // common browser/address-bar limit

export function isValidUrl(value) {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (trimmed === "" || trimmed.length > MAX_URL_LENGTH) return false;

  try {
    return ALLOWED_PROTOCOLS.includes(new URL(trimmed).protocol);
  } catch {
    return false;
  }
}
