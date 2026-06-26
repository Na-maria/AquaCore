const SEVERITY_LABELS = {
  critical: 'Crítico',
  warning: 'Alerta',
  normal: 'Normal',
};

export default function AlertsPanel({ alerts }) {
  return (
    <div className="panel-card">
      <div className="panel-header">
        <h3>Alertas em tempo real</h3>
        <span className="live-badge">
          <span className="live-dot" />
          ao vivo
        </span>
      </div>

      <ul className="alerts-list">
        {alerts.map((alert, i) => (
          <li key={i} className="alert-row">
            <span className={`severity-badge severity-${alert.severity}`}>
              {SEVERITY_LABELS[alert.severity]}
            </span>
            <div className="alert-text">
              <p>{alert.message}</p>
              <span className="alert-time">{alert.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
