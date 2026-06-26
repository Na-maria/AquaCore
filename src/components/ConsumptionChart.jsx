import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function ConsumptionChart({ data }) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h2>Consumo hídrico — Real vs Previsão IA</h2>
        <p>Últimas 24h e próximas 24h • litros / hora (em milhares)</p>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E1E4DC" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 11, fill: '#6B7E8C' }}
              axisLine={{ stroke: '#E1E4DC' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7E8C' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #E1E4DC',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 13,
              }}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 12, fontFamily: 'Space Grotesk, sans-serif' }}
            />
            <Line
              type="monotone"
              dataKey="real"
              name="Real"
              stroke="#37B1FF"
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Previsão IA"
              stroke="#75A3BF"
              strokeWidth={2.5}
              strokeDasharray="6 4"
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
