import { Bell, Database, Gauge, Users } from "lucide-react";
import PageHeader from "../components/PageHeader";

export default function SettingsPage() {
  return (
    <div className="page">
      <PageHeader eyebrow="Sistema" title="Configurações" />

      <section className="panel-card">
        <div className="panel-header">
          <h3>
            <Bell
              size={16}
              style={{ verticalAlign: "middle", marginRight: 6 }}
            />
            Alertas
          </h3>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-label">Notificar consumo acima da meta</p>
            <span className="settings-sub">
              Dispara alerta quando o consumo diário superar a meta definida
            </span>
          </div>
          <ToggleMock checked />
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-label">Alerta de temperatura crítica</p>
            <span className="settings-sub">
              Acima de 45°C em qualquer servidor
            </span>
          </div>
          <ToggleMock checked />
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-label">Resumo semanal por e-mail</p>
            <span className="settings-sub">
              Envia um relatório consolidado toda segunda-feira
            </span>
          </div>
          <ToggleMock />
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>
            <Gauge
              size={16}
              style={{ verticalAlign: "middle", marginRight: 6 }}
            />
            Metas e limites
          </h3>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-label">Meta diária de consumo hídrico</p>
            <span className="settings-sub">
              Limite usado para calcular os indicadores de variação
            </span>
          </div>
          <span className="settings-value">3.6M L</span>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-label">Temperatura ideal dos racks</p>
            <span className="settings-sub">
              Faixa considerada normal de operação
            </span>
          </div>
          <span className="settings-value">32–36°C</span>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>
            <Database
              size={16}
              style={{ verticalAlign: "middle", marginRight: 6 }}
            />
            Conexão com o banco de dados
          </h3>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-label">Fonte de dados</p>
            <span className="settings-sub">SQLite local — API AquaCore</span>
          </div>
          <span className="connection-status">
            <span className="live-dot" /> conectado
          </span>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>
            <Users
              size={16}
              style={{ verticalAlign: "middle", marginRight: 6 }}
            />
            Equipe
          </h3>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-label">Ana Maria, Samile, Beatriz</p>
            <span className="settings-sub">
              Huawei ICT Academy — Sprint Final, Equipe 1
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

function ToggleMock({ checked = false }) {
  return (
    <div className={`toggle-mock ${checked ? "toggle-on" : ""}`}>
      <div className="toggle-knob" />
    </div>
  );
}
