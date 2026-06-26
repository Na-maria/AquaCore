import { useEffect, useState } from 'react';
import MetricCard from '../components/MetricCard';
import ConsumptionChart from '../components/ConsumptionChart';
import AlertsPanel from '../components/AlertsPanel';
import ServerRanking from '../components/ServerRanking';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';
import { fetchDashboardData } from '../api/client';
import { MOCK_DATA } from '../data/mockData';
import { Droplet, Thermometer, Cpu, BrainCircuit, Bell } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(true);
  const [usingLiveData, setUsingLiveData] = useState(false);

  useEffect(() => {
    fetchDashboardData()
      .then((res) => {
        setData(res);
        setUsingLiveData(true);
      })
      .catch(() => {
        setUsingLiveData(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const alertCount = data.alerts.filter((a) => a.severity !== 'normal').length;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Bem-vindo de volta"
        title="Data Center São Paulo — Núcleo IA"
        action={
          <div className="topbar-actions">
            <span className="status-badge">
              <span className="status-dot" />
              {data.systemStatus}
            </span>
            <button className="notif-button" aria-label={`${alertCount} alertas`}>
              <Bell size={18} />
              {alertCount > 0 && <span className="notif-count">{alertCount}</span>}
            </button>
          </div>
        }
      />

      <section className="metrics-grid">
        <MetricCard
          icon={<Droplet size={20} />}
          label="Consumo hídrico hoje"
          value={data.metrics.waterToday.value}
          unit="L"
          delta={data.metrics.waterToday.delta}
          deltaLabel="vs meta diária"
          deltaDirection={data.metrics.waterToday.direction}
        />
        <MetricCard
          icon={<Thermometer size={20} />}
          label="Temperatura média"
          value={data.metrics.avgTemp.value}
          unit="°C"
          delta={data.metrics.avgTemp.delta}
          deltaLabel="vs média semanal"
          deltaDirection={data.metrics.avgTemp.direction}
        />
        <MetricCard
          icon={<Cpu size={20} />}
          label="Carga de CPU"
          value={data.metrics.cpuLoad.value}
          unit="%"
          delta={data.metrics.cpuLoad.delta}
          deltaLabel="vs pico do dia"
          deltaDirection={data.metrics.cpuLoad.direction}
        />
        <MetricCard
          icon={<BrainCircuit size={20} />}
          label="Previsão IA (24h)"
          value={data.metrics.aiForecast.value}
          unit="L"
          badge="POWERED BY IA"
          deltaLabel="estimativa próximas 24h"
        />
      </section>

      <section className="chart-section">
        <ConsumptionChart data={data.consumptionSeries} />
      </section>

      <section className="lower-grid">
        <AlertsPanel alerts={data.alerts} />
        <ServerRanking servers={data.servers} />
      </section>

      <Footer />

      {!loading && !usingLiveData && (
        <p className="data-source-note">
          Exibindo dados de demonstração — conecte a API local com SQLite para dados parametrizados.
        </p>
      )}
    </div>
  );
}
