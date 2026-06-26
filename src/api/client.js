// URL da API local do AquaCore, alimentada por SQLite.
// Em producao, troque por VITE_API_URL apontando para o backend publicado.
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/dashboard';

export async function fetchDashboardData() {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error(`Erro ao buscar dados do dashboard: ${res.status}`);
  }

  const data = await res.json();
  return data;
}
