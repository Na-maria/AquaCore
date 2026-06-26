export default function ServerRanking({ servers }) {
  const max = Math.max(...servers.map((s) => s.liters));

  return (
    <div className="panel-card">
      <div className="panel-header">
        <h3>Ranking de consumo</h3>
      </div>

      <ul className="ranking-list">
        {servers.map((server) => (
          <li key={server.name} className="ranking-row">
            <div className="ranking-row-top">
              <span className="ranking-name">{server.name}</span>
              <span className="ranking-value">{server.label}</span>
            </div>
            <div className="ranking-bar-track">
              <div
                className="ranking-bar-fill"
                style={{ width: `${(server.liters / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
