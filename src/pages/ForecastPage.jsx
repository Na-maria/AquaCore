import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BrainCircuit, TrendingUp, Target, Database } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { FORECAST_SERIES, MODEL_INFO } from '../data/mockData';

export default function ForecastPage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Inteligência Artificial"
        title="Previsão de consumo hídrico"
      />

      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon"><Target size={20} /></div>
          </div>
          <p className="metric-label">Acurácia do modelo</p>
          <p className="metric-value">{MODEL_INFO.accuracy}<span className="metric-unit">%</span></p>
          <p className="metric-delta"><span className="metric-delta-label">últimos 30 dias</span></p>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon"><TrendingUp size={20} /></div>
          </div>
          <p className="metric-label">Erro médio (MAE)</p>
          <p className="metric-value">{MODEL_INFO.mae}<span className="metric-unit">k L</span></p>
          <p className="metric-delta"><span className="metric-delta-label">por janela de 2h</span></p>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon"><Database size={20} /></div>
          </div>
          <p className="metric-label">Amostras de treino</p>
          <p className="metric-value">{MODEL_INFO.samples}<span className="metric-unit">k</span></p>
          <p className="metric-delta"><span className="metric-delta-label">registros de sensores</span></p>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon"><BrainCircuit size={20} /></div>
            <span className="metric-badge">SQLite + API</span>
          </div>
          <p className="metric-label">Última atualização</p>
          <p className="metric-value" style={{ fontSize: 22 }}>{MODEL_INFO.lastUpdate}</p>
          <p className="metric-delta"><span className="metric-delta-label">re-treino automático diário</span></p>
        </div>
      </section>

      <section className="chart-card">
        <div className="chart-header">
          <h2>Projeção estendida — 7 dias</h2>
          <p>Faixa de confiança da previsão em litros/hora (em milhares)</p>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={FORECAST_SERIES} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#37B1FF" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#37B1FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E1E4DC" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6B7E8C' }} axisLine={{ stroke: '#E1E4DC' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7E8C' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}k`} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E1E4DC', fontFamily: 'Space Grotesk, sans-serif', fontSize: 13 }} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontFamily: 'Space Grotesk, sans-serif' }} />
            <Area type="monotone" dataKey="max" name="Limite superior" stroke="none" fill="url(#forecastFill)" />
            <Area type="monotone" dataKey="predicted" name="Previsão" stroke="#37B1FF" strokeWidth={2.5} fill="transparent" />
            <Area type="monotone" dataKey="min" name="Limite inferior" stroke="none" fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <section className="panel-card">
        <div className="panel-header">
          <h3>Como funciona o modelo</h3>
        </div>
        <p className="model-explainer">
          O modelo usa uma base local em <strong>SQLite</strong> com dados sintéticos parametrizados a partir de
          temperatura, carga de CPU, eficiência de resfriamento e consumo hídrico estimado por servidor. A cada
          nova janela de leituras, a API recalcula a previsão para as próximas 24 horas, permitindo que a equipe
          antecipe picos de consumo antes que aconteçam e ajuste o resfriamento ou a distribuição de carga
          preventivamente. A estrutura foi desenhada para migração futura para cloud.
        </p>
      </section>
    </div>
  );
}
