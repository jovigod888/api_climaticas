const { describeWeatherCode } = require('../utils/weatherCodes');

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const FETCH_TIMEOUT_MS = 10_000;

// Quantos países entram em cada requisição de lote para a Open-Meteo, e
// quantos lotes rodam em paralelo. Ajustáveis por variável de ambiente
// caso a API de terceiros mude de comportamento no futuro.
const BATCH_SIZE = Number(process.env.WEATHER_BATCH_SIZE) || 40;
const BATCH_CONCURRENCY = Number(process.env.WEATHER_BATCH_CONCURRENCY) || 4;

const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'is_day',
].join(',');

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Executa `worker` para cada item de `items`, com no máximo `limit`
 * execuções simultâneas. Pool de concorrência simples, sem dependências.
 */
async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runNext() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await worker(items[current], current);
    }
  }

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, runNext));

  return results;
}

async function fetchJsonWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Open-Meteo respondeu com status HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Tempo de resposta da Open-Meteo excedido (${timeoutMs}ms)`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildSuccessResult(country, current) {
  const { description, icon } = describeWeatherCode(current.weather_code);
  return {
    code: country.code,
    code2: country.code2,
    name: country.name,
    namePt: country.namePt,
    capital: country.capital,
    region: country.region,
    subregion: country.subregion,
    flag: country.flag,
    lat: country.lat,
    lng: country.lng,
    weather: {
      temperature: current.temperature_2m ?? null,
      apparentTemperature: current.apparent_temperature ?? null,
      humidity: current.relative_humidity_2m ?? null,
      precipitation: current.precipitation ?? null,
      windSpeed: current.wind_speed_10m ?? null,
      windDirection: current.wind_direction_10m ?? null,
      isDay: current.is_day === 1,
      weatherCode: current.weather_code ?? null,
      description,
      icon,
      observedAt: current.time ?? null,
    },
    units: {
      temperature: '°C',
      windSpeed: 'km/h',
      precipitation: 'mm',
    },
    error: null,
  };
}

function buildErrorResult(country, message) {
  return {
    code: country.code,
    code2: country.code2,
    name: country.name,
    namePt: country.namePt,
    capital: country.capital,
    region: country.region,
    subregion: country.subregion,
    flag: country.flag,
    lat: country.lat,
    lng: country.lng,
    weather: null,
    units: null,
    error: message || 'Não foi possível obter o clima deste país',
  };
}

/**
 * Busca o clima atual de um lote de países em UMA ÚNICA requisição à
 * Open-Meteo, passando várias coordenadas separadas por vírgula
 * (latitude=lat1,lat2,...&longitude=lng1,lng2,...). Nesse formato a API
 * responde com um array, um item por localização, na mesma ordem em que
 * foram enviadas.
 *
 * Se o lote inteiro falhar (timeout, rede fora do ar, etc.), cada país do
 * lote recebe um resultado de erro individual em vez de derrubar toda a
 * requisição — assim um problema pontual não impede o resto da resposta.
 */
async function fetchWeatherBatch(countriesBatch) {
  if (countriesBatch.length === 0) return [];

  const latitude = countriesBatch.map((c) => c.lat).join(',');
  const longitude = countriesBatch.map((c) => c.lng).join(',');
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: CURRENT_FIELDS,
    timezone: 'auto',
  });
  const url = `${OPEN_METEO_URL}?${params.toString()}`;

  try {
    const data = await fetchJsonWithTimeout(url, FETCH_TIMEOUT_MS);
    // Com uma localização só, a Open-Meteo retorna um objeto único; com
    // várias, retorna um array — normalizamos os dois casos aqui.
    const items = Array.isArray(data) ? data : [data];

    return countriesBatch.map((country, index) => {
      const item = items[index];
      if (!item || !item.current) {
        return buildErrorResult(country, 'Resposta da Open-Meteo sem dados para este país');
      }
      return buildSuccessResult(country, item.current);
    });
  } catch (error) {
    return countriesBatch.map((country) => buildErrorResult(country, error.message));
  }
}

/**
 * Busca o clima atual de uma lista de países, em lotes paralelos.
 * @param {Array} countriesList - países vindos do countriesService
 * @returns {Promise<Array>} um resultado (sucesso ou erro) por país, na mesma ordem
 */
async function getWeatherForCountries(countriesList) {
  const batches = chunk(countriesList, BATCH_SIZE);
  const batchResults = await runWithConcurrency(batches, BATCH_CONCURRENCY, fetchWeatherBatch);
  return batchResults.flat();
}

/**
 * Busca o clima atual de um único país.
 * @param {Object} country - país vindo do countriesService
 */
async function getWeatherForCountry(country) {
  const [result] = await fetchWeatherBatch([country]);
  return result;
}

module.exports = { getWeatherForCountries, getWeatherForCountry };
