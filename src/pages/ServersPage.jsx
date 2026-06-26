import { Server, Thermometer, Droplet, Cpu } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { SERVERS_DETAIL } from '../data/mockData';

const STATUS_LABELS = {
  critical: 'Crítico',
  warning: 'Atenção',
  normal: 'Normal',
};

export default function ServersPage() {
  return (
    <div className="page">
      <PageHeader eyebrow="Infraestrutura" title="Servidores monitorados" />

      <section className="servers-grid">
        {SERVERS_DETAIL.map((server) => (
          <div key={server.name} className="server-card">
            <div className="server-card-header">
              <div className="server-card-title">
                <Server size={18} />
                <span>{server.name}</span>
              </div>
              <span className={`severity-badge severity-${server.status}`}>
                {STATUS_LABELS[server.status]}
              </span>
            </div>

            <div className="server-card-stats">
              <div className="server-stat">
                <Droplet size={15} />
                <div>
                  <span className="server-stat-value">{server.water}</span>
                  <span className="server-stat-label">consumo hoje</span>
                </div>
              </div>
              <div className="server-stat">
                <Thermometer size={15} />
                <div>
                  <span className="server-stat-value">{server.temp}°C</span>
                  <span className="server-stat-label">temperatura</span>
                </div>
              </div>
              <div className="server-stat">
                <Cpu size={15} />
                <div>
                  <span className="server-stat-value">{server.cpu}%</span>
                  <span className="server-stat-label">carga CPU</span>
                </div>
              </div>
            </div>

            <div className="ranking-bar-track" style={{ marginTop: 6 }}>
              <div
                className="ranking-bar-fill"
                style={{
                  width: `${server.cpu}%`,
                  background:
                    server.status === 'critical'
                      ? 'linear-gradient(90deg, #E04848, #f59f9f)'
                      : server.status === 'warning'
                      ? 'linear-gradient(90deg, #C98A1E, #f0c878)'
                      : 'linear-gradient(90deg, #37B1FF, #99D0F2)',
                }}
              />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
