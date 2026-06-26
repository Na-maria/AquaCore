import { ArrowUp, ArrowDown } from 'lucide-react';

export default function MetricCard({
  icon,
  label,
  value,
  unit,
  delta,
  deltaLabel,
  deltaDirection, // 'up' | 'down'
  badge,
}) {
  const isUp = deltaDirection === 'up';
  const deltaColorClass = deltaDirection
    ? deltaDirection === 'up'
      ? 'delta-up'
      : 'delta-down'
    : '';

  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <div className="metric-icon">{icon}</div>
        {badge && <span className="metric-badge">{badge}</span>}
      </div>

      <p className="metric-label">{label}</p>

      <p className="metric-value">
        {value}
        <span className="metric-unit">{unit}</span>
      </p>

      <p className={`metric-delta ${deltaColorClass}`}>
        {deltaDirection && (isUp ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}
        {delta && <span>{delta}</span>}
        <span className="metric-delta-label">{deltaLabel}</span>
      </p>
    </div>
  );
}
