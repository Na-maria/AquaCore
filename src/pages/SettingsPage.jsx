import { useEffect, useState } from 'react';
import { Bell, Database, Gauge, Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { fetchSettings } from '../api/client';

const DEFAULT_SETTINGS = {
  alerts: {
    overTarget: true,
    criticalTemperature: true,
    weeklyEmail: false,
  },
  limits: {
    dailyWaterTarget: '3.6M L',
    idealTemperatureRange: '32-36 C',
  },
  database: {
    source: 'SQLite local - API AquaCore',
    status: 'conectado',
  },
  team: 'Ana Maria, Samile, Beatriz, Odnan',
  course: 'Huawei ICT Academy - Sprint Final, Equipe 2',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data,
          alerts: { ...DEFAULT_SETTINGS.alerts, ...data.alerts },
          limits: { ...DEFAULT_SETTINGS.limits, ...data.limits },
          database: { ...DEFAULT_SETTINGS.database, ...data.database },
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="page">
      <PageHeader eyebrow="Sistema" title="Configuracoes" />

      <section className="panel-card">
        <div className="panel-header">
          <h3><Bell size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Alertas</h3>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-label">Notificar consumo acima da meta</p>
            <span className="settings-sub">Dispara alerta quando o consumo diario superar a meta definida</span>
          </div>
          <ToggleMock checked={settings.alerts.overTarget} />
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-label">Alerta de temperatura critica</p>
            <span className="settings-sub">Acima de 45 C em qualquer servidor</span>
          </div>
          <ToggleMock checked={settings.alerts.criticalTemperature} />
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-label">Resumo semanal por e-mail</p>
            <span className="settings-sub">Envia um relatorio consolidado toda segunda-feira</span>
          </div>
          <ToggleMock checked={settings.alerts.weeklyEmail} />
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3><Gauge size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Metas e limites</h3>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-label">Meta diaria de consumo hidrico</p>
            <span className="settings-sub">Limite usado para calcular os indicadores de variacao</span>
          </div>
          <span className="settings-value">{settings.limits.dailyWaterTarget}</span>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-label">Temperatura ideal dos racks</p>
            <span className="settings-sub">Faixa considerada normal de operacao</span>
          </div>
          <span className="settings-value">{settings.limits.idealTemperatureRange}</span>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3><Database size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Conexao com o banco de dados</h3>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-label">Fonte de dados</p>
            <span className="settings-sub">{settings.database.source}</span>
          </div>
          <span className="connection-status">
            <span className="live-dot" /> {settings.database.status}
          </span>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3><Users size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Equipe</h3>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-label">{settings.team}</p>
            <span className="settings-sub">{settings.course}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function ToggleMock({ checked = false }) {
  return (
    <div className={`toggle-mock ${checked ? 'toggle-on' : ''}`}>
      <div className="toggle-knob" />
    </div>
  );
}
