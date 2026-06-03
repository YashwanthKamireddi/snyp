import { useState } from "react";
import { shortenUrl } from "../api.js";

// Shown next to the custom-code field so the user sees the full link they'll get.
const ORIGIN = typeof window !== "undefined" ? window.location.origin : "";

export default function ShortenForm({ onCreated }) {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult(null);
    setCopied(false);
    setLoading(true);

    try {
      const created = await shortenUrl(url, customCode.trim());
      setResult(created);
      setUrl("");
      setCustomCode("");
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="shortener">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <span className="prefix">https://</span>
          <input
            type="text"
            className="input"
            placeholder="paste a long link to cut down…"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            aria-label="Long URL"
          />
          <button type="submit" className="button" disabled={loading}>
            {loading ? "Cutting…" : "Shorten"}
          </button>
        </div>

        <div className="custom">
          <label className="custom-label" htmlFor="custom-code">
            Custom code — optional
          </label>
          <div className="custom-field">
            <span className="custom-prefix">{ORIGIN}/</span>
            <input
              id="custom-code"
              type="text"
              className="input"
              placeholder="your-own-code"
              value={customCode}
              onChange={(event) => setCustomCode(event.target.value)}
              aria-label="Custom short code"
            />
          </div>
          <p className="custom-hint">
            Leave empty for a random code · 3–20 letters, numbers, and hyphens.
          </p>
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <span className="result-label">Your link</span>
          <a className="short-link" href={result.shortUrl} target="_blank" rel="noreferrer">
            {result.shortUrl}
          </a>
          <button
            type="button"
            className={copied ? "copy copied" : "copy"}
            onClick={handleCopy}
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
