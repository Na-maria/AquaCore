export const MOCK_DATA = {
  systemStatus: 'Sistema em Alerta',
  metrics: {
    waterToday: { value: '4.2M', delta: '+18%', direction: 'up' },
    avgTemp: { value: '38', delta: '+2°C', direction: 'up' },
    cpuLoad: { value: '74', delta: '-3%', direction: 'down' },
    aiForecast: { value: '5.8M' },
  },
  consumptionSeries: [
    { hour: '00h', real: 140, forecast: null },
    { hour: '02h', real: 132, forecast: null },
    { hour: '04h', real: 120, forecast: null },
    { hour: '06h', real: 150, forecast: null },
    { hour: '08h', real: 190, forecast: null },
    { hour: '10h', real: 210, forecast: null },
    { hour: '12h', real: 230, forecast: null },
    { hour: '14h', real: 250, forecast: 250 },
    { hour: '16h', real: null, forecast: 270 },
    { hour: '18h', real: null, forecast: 240 },
    { hour: '20h', real: null, forecast: 200 },
    { hour: '22h', real: null, forecast: 170 },
  ],
  alerts: [
    {
      severity: 'critical',
      message: 'Servidor A3 — temp. 47°C, resfriamento extra ativado',
      time: 'agora',
    },
    {
      severity: 'warning',
      message: 'Previsão de pico hídrico às 16h',
      time: '5 min',
    },
    {
      severity: 'warning',
      message: 'Consumo mensal em 72% da cota',
      time: '22 min',
    },
    {
      severity: 'normal',
      message: 'Servidor B1 — operação normal',
      time: '1 h',
    },
  ],
  servers: [
    { name: 'Servidor A3', liters: 920, label: '920k L' },
    { name: 'Servidor B2', liters: 680, label: '680k L' },
    { name: 'Servidor C1', liters: 550, label: '550k L' },
    { name: 'Servidor D4', liters: 400, label: '400k L' },
    { name: 'Servidor E2', liters: 280, label: '280k L' },
  ],
};

export const MODEL_INFO = {
  accuracy: '94.2',
  mae: '38',
  samples: '212',
  lastUpdate: 'Hoje, 03:00',
};

export const FORECAST_SERIES = [
  { day: 'Seg', predicted: 4100, min: 3700, max: 4500 },
  { day: 'Ter', predicted: 4300, min: 3900, max: 4700 },
  { day: 'Qua', predicted: 4450, min: 4000, max: 4900 },
  { day: 'Qui', predicted: 4900, min: 4300, max: 5500 },
  { day: 'Sex', predicted: 5200, min: 4600, max: 5800 },
  { day: 'Sáb', predicted: 3800, min: 3400, max: 4200 },
  { day: 'Dom', predicted: 3600, min: 3200, max: 4000 },
];

export const SERVERS_DETAIL = [
  { name: 'Servidor A3', status: 'critical', water: '920k L', temp: 47, cpu: 92 },
  { name: 'Servidor B2', status: 'warning', water: '680k L', temp: 41, cpu: 68 },
  { name: 'Servidor C1', status: 'normal', water: '550k L', temp: 36, cpu: 55 },
  { name: 'Servidor D4', status: 'normal', water: '400k L', temp: 34, cpu: 40 },
  { name: 'Servidor E2', status: 'normal', water: '280k L', temp: 33, cpu: 28 },
  { name: 'Servidor B1', status: 'normal', water: '260k L', temp: 32, cpu: 25 },
];

export const REPORTS = [
  { id: 1, title: 'Relatório mensal — Maio 2026', date: '01/06/2026', size: '1.2 MB' },
  { id: 2, title: 'Relatório mensal — Abril 2026', date: '01/05/2026', size: '1.1 MB' },
  { id: 3, title: 'Relatório mensal — Março 2026', date: '01/04/2026', size: '980 KB' },
  { id: 4, title: 'Auditoria de consumo — Q1 2026', date: '05/04/2026', size: '2.4 MB' },
];
