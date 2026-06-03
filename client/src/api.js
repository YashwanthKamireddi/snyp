// Thin wrapper around the backend HTTP API. Each call returns parsed JSON or
// throws an Error with a friendly message — including when the server replies
// with a non-JSON body (e.g. a plain-text error while a host is waking up).

async function request(path, options) {
  let response;
  try {
    response = await fetch(path, options);
  } catch {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }

  const body = await response.text();
  let data = null;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    data = null; // server returned something that isn't JSON
  }

  if (!response.ok || data === null) {
    throw new Error(
      (data && data.error) ||
        "The server isn't responding right now — it may be waking up. Try again in a few seconds."
    );
  }
  return data;
}

export function shortenUrl(url, customCode) {
  return request("/api/shorten", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, customCode: customCode || undefined }),
  });
}

export function fetchUrls() {
  return request("/api/urls");
}
