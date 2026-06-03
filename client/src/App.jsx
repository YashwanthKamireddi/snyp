import { useEffect, useState } from "react";
import ShortenForm from "./components/ShortenForm.jsx";
import UrlList from "./components/UrlList.jsx";
import { fetchUrls } from "./api.js";

export default function App() {
  const [urls, setUrls] = useState([]);

  async function loadUrls() {
    try {
      setUrls(await fetchUrls());
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadUrls();
  }, []);

  const totalClicks = urls.reduce((sum, item) => sum + item.clicks, 0);

  return (
    <div className="page">
      <header className="masthead reveal reveal-1">
        <span className="mark">
          Snyp<span className="dot">●</span>
        </span>
        <span>URL Shortener</span>
      </header>

      <section className="hero">
        <h1 className="wordmark reveal reveal-1">
          Snyp<span className="stop">.</span>
        </h1>
        <p className="tagline reveal reveal-2">Long links, cut clean.</p>

        <div className="reveal reveal-3">
          <ShortenForm onCreated={loadUrls} />
        </div>
      </section>

      <section className="archive">
        <div className="archive-head">
          <h2 className="archive-title">The Archive</h2>
          <div className="stats">
            <span>
              <b>{urls.length}</b> links
            </span>
            <span>
              <b>{totalClicks}</b> clicks
            </span>
          </div>
        </div>

        <UrlList urls={urls} />
      </section>
    </div>
  );
}
