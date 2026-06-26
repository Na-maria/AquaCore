import { FileText, Download, Calendar } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { REPORTS } from '../data/mockData';

export default function ReportsPage() {
  return (
    <div className="page">
      <PageHeader eyebrow="Documentação" title="Relatórios" />

      <section className="panel-card">
        <div className="panel-header">
          <h3>Relatórios mensais gerados</h3>
        </div>

        <ul className="reports-list">
          {REPORTS.map((report) => (
            <li key={report.id} className="report-row">
              <div className="report-icon">
                <FileText size={18} />
              </div>
              <div className="report-info">
                <p className="report-title">{report.title}</p>
                <span className="report-meta">
                  <Calendar size={12} /> {report.date} · {report.size}
                </span>
              </div>
              <button className="report-download" aria-label={`Baixar ${report.title}`}>
                <Download size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>Resumo do período atual</h3>
        </div>
        <p className="model-explainer">
          O relatório mensal consolida o consumo hídrico total, os picos registrados por servidor,
          a precisão das previsões geradas pela IA e recomendações automáticas de otimização —
          como redistribuição de carga entre racks e ajuste de metas de resfriamento — geradas
          a partir dos dados armazenados na base local SQLite, com arquitetura preparada para migração futura para cloud.
        </p>
      </section>
    </div>
  );
}
