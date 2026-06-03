// Thin wrapper around the backend HTTP API. Each call returns parsed JSON or
// throws an Error carrying the server's message, so components can stay simple.

export async function shortenUrl(url, customCode) {
  const response = await fetch("/api/shorten", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, customCode: customCode || undefined }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Could not shorten that URL.");
  }
  return data;
}

export async function fetchUrls() {
  const response = await fetch("/api/urls");
  if (!response.ok) {
    throw new Error("Could not load your links.");
  }
  return response.json();
}
