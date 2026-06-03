// JSON API consumed by the frontend.
//   POST /api/shorten  -> create a short link (with an optional custom code)
//   GET  /api/urls     -> list every short link (newest first)

import { Router } from "express";
import { nanoid } from "nanoid";
import { createUrl, getAllUrls, DuplicateKeyError } from "../db.js";
import { isValidUrl } from "../lib/validateUrl.js";
import { isValidCustomCode, CODE_RULES } from "../lib/validateCode.js";

const router = Router();

const KEY_LENGTH = 7;
const MAX_INSERT_ATTEMPTS = 5;

// Build an absolute short URL from the incoming request, so links resolve to
// whatever host the server is reachable on (localhost in dev, the real domain
// once deployed).
function buildShortUrl(req, shortKey) {
  return `${req.protocol}://${req.get("host")}/${shortKey}`;
}

function toResponse(req, row) {
  return {
    shortKey: row.short_key,
    originalUrl: row.original_url,
    shortUrl: buildShortUrl(req, row.short_key),
    clicks: row.clicks,
    createdAt: row.created_at,
  };
}

router.post("/shorten", (req, res) => {
  const { url, customCode } = req.body;

  if (!isValidUrl(url)) {
    return res.status(400).json({
      error: "Please provide a valid URL starting with http:// or https://",
    });
  }

  // Custom code path: the user picked the key, so a clash is a real 409 rather
  // than something to retry around.
  if (customCode != null && customCode !== "") {
    const code = String(customCode).trim();

    if (!isValidCustomCode(code)) {
      return res.status(400).json({ error: `Invalid custom code — use ${CODE_RULES}` });
    }

    try {
      return res.status(201).json(toResponse(req, createUrl(code, url.trim())));
    } catch (err) {
      if (err instanceof DuplicateKeyError) {
        return res.status(409).json({ error: "That custom code is already taken." });
      }
      throw err;
    }
  }

  // Random code path: nanoid collisions are vanishingly unlikely, but retrying a
  // few times makes a duplicate impossible rather than merely improbable.
  for (let attempt = 0; attempt < MAX_INSERT_ATTEMPTS; attempt++) {
    try {
      return res.status(201).json(toResponse(req, createUrl(nanoid(KEY_LENGTH), url.trim())));
    } catch (err) {
      if (err instanceof DuplicateKeyError) continue;
      throw err;
    }
  }

  return res
    .status(500)
    .json({ error: "Could not generate a unique link, please try again." });
});

router.get("/urls", (req, res) => {
  res.json(getAllUrls().map((row) => toResponse(req, row)));
});

export default router;
