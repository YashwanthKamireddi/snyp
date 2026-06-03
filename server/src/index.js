import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import urlsRouter from "./routes/urls.js";
import redirectRouter from "./routes/redirect.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Behind a hosting proxy (e.g. Render), trust X-Forwarded-* so generated short
// links use the public https domain rather than the internal host.
app.set("trust proxy", true);

app.use(cors());
app.use(express.json());

app.use("/api", urlsRouter);
app.get("/health", (req, res) => res.json({ status: "ok" }));

// In production the React app is built to client/dist; serve it from here so the
// whole app runs as one service. Static files are mounted before the "/:key"
// redirect so real assets aren't treated as short keys.
const clientDist = path.join(__dirname, "..", "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  // Vite content-hashes asset filenames, so they're safe to cache long-term.
  app.use(express.static(clientDist, { index: false, maxAge: "1y" }));
  // The HTML entry point must never be cached, so a redeploy's new asset hashes
  // are always picked up instead of a stale page.
  app.get("/", (req, res) => {
    res.set("Cache-Control", "no-cache");
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use("/", redirectRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`Snyp running at http://localhost:${PORT}`);
});

// Keep-alive: free hosts spin an instance down after a stretch of no traffic,
// which adds a ~50s delay to the next visit. When deployed (Render sets
// RENDER_EXTERNAL_URL), ping our own health endpoint every 10 minutes so the
// instance stays warm and opens instantly. Does nothing in local development.
const keepAliveUrl = process.env.RENDER_EXTERNAL_URL;
if (keepAliveUrl) {
  const TEN_MINUTES = 10 * 60 * 1000;
  setInterval(() => {
    fetch(`${keepAliveUrl}/health`).catch(() => {});
  }, TEN_MINUTES);
}
