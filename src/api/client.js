// URL da API local do AquaCore, alimentada por SQLite.
// Em producao, troque por VITE_API_URL apontando para o backend publicado.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

async function fetchJson(path) {
  const res = await fetch(`${API_BASE_URL}${path}`);

  if (!res.ok) {
    throw new Error(`Erro ao buscar dados da API: ${res.status}`);
  }

  return res.json();
}

export async function fetchDashboardData() {
  return fetchJson('/dashboard');
}

export async function fetchForecastData() {
  return fetchJson('/forecast');
}

export async function fetchServerDetails() {
  return fetchJson('/server-details');
}

export async function fetchReports() {
  return fetchJson('/reports');
}

export async function fetchSettings() {
  return fetchJson('/settings');
}
