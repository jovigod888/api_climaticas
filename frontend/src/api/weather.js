const BASE = '/api';

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`A API respondeu com status ${response.status}`);
  }
  return response.json();
}

/**
 * Busca o clima de todos os países (ou de um subconjunto, com os mesmos
 * filtros que a API aceita). Não recebe search/region aqui de propósito:
 * o filtro é feito no cliente, em cima da lista completa já carregada —
 * ver o hook useWeather.
 */
export function fetchAllWeather({ refresh = false } = {}) {
  const params = new URLSearchParams();
  if (refresh) params.set('refresh', 'true');
  const query = params.toString();
  return getJson(`${BASE}/weather${query ? `?${query}` : ''}`);
}
