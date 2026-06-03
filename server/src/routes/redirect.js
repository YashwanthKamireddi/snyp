// Public short links: GET /:key -> redirect to the original URL.

import { Router } from "express";
import { getUrlByKey, recordClick } from "../db.js";

const router = Router();

router.get("/:key", (req, res) => {
  const entry = getUrlByKey(req.params.key);

  if (!entry) {
    return res.status(404).send("Short link not found. It may have been mistyped.");
  }

  recordClick(req.params.key);

  // 302 (temporary), not 301: a 301 is cached permanently by browsers, which
  // would stop the click counter from ever updating again.
  res.redirect(302, entry.original_url);
});

export default router;
