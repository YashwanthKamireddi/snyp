// Validates an optional user-chosen short code (e.g. /my-link).

const CODE_PATTERN = /^[a-zA-Z0-9-]{3,20}$/;

// Codes that would collide with real routes or read oddly as a link.
const RESERVED = new Set(["api", "health", "assets"]);

export function isValidCustomCode(code) {
  return CODE_PATTERN.test(code) && !RESERVED.has(code.toLowerCase());
}

export const CODE_RULES = "3–20 characters: letters, numbers, and hyphens only.";
