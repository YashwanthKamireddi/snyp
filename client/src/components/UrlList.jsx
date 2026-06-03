export default function UrlList({ urls }) {
  if (urls.length === 0) {
    return (
      <div className="empty">
        <div className="empty-mark">∅</div>
        <p>No clippings yet — shorten a link above.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
    <table className="table">
      <thead>
        <tr>
          <th>Short</th>
          <th>Destination</th>
          <th className="col-clicks">Clicks</th>
        </tr>
      </thead>
      <tbody>
        {urls.map((item, index) => (
          <tr key={item.shortKey} style={{ animationDelay: `${index * 0.05}s` }}>
            <td className="row-key">
              <a href={item.shortUrl} target="_blank" rel="noreferrer">
                <span className="slash">/</span>
                {item.shortKey}
              </a>
            </td>
            <td className="row-original">
              <span title={item.originalUrl}>{item.originalUrl}</span>
            </td>
            <td className="row-clicks">
              <span className="count">{item.clicks}</span>
              <span className="count-label">hits</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
