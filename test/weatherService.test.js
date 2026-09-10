const test = require('node:test');
const assert = require('node:assert/strict');

// Restauramos o fetch original depois de cada teste para não vazar mocks.
const originalFetch = global.fetch;
test.afterEach(() => {
  global.fetch = originalFetch;
});

function mockCurrentResponse(overrides = {}) {
  return {
    current: {
      time: '2026-09-09T12:00',
      temperature_2m: 25.4,
      relative_humidity_2m: 60,
      apparent_temperature: 26.1,
      precipitation: 0,
      weather_code: 1,
      wind_speed_10m: 10.5,
      wind_direction_10m: 180,
      is_day: 1,
      ...overrides,
    },
  };
}

test('getWeatherForCountry mapeia corretamente uma resposta de localização única', async () => {
  global.fetch = async () => ({
    ok: true,
    json: async () => mockCurrentResponse(),
  });

  // Requer depois de mockar o fetch para garantir que o módulo o utilize.
  delete require.cache[require.resolve('../src/services/weatherService')];
  const weatherService = require('../src/services/weatherService');

  const country = { code: 'BRA', code2: 'BR', name: 'Brazil', namePt: 'Brasil', capital: 'Brasília', region: 'Americas', subregion: 'South America', flag: '🇧🇷', lat: -15.79, lng: -47.88 };
  const result = await weatherService.getWeatherForCountry(country);

  assert.equal(result.error, null);
  assert.equal(result.code, 'BRA');
  assert.equal(result.weather.temperature, 25.4);
  assert.equal(result.weather.description, 'Predominantemente limpo');
});

test('getWeatherForCountries mapeia corretamente uma resposta em lote (array)', async () => {
  global.fetch = async () => ({
    ok: true,
    json: async () => [mockCurrentResponse({ temperature_2m: 10 }), mockCurrentResponse({ temperature_2m: 30 })],
  });

  delete require.cache[require.resolve('../src/services/weatherService')];
  const weatherService = require('../src/services/weatherService');

  const countries = [
    { code: 'AAA', code2: 'AA', name: 'A', namePt: 'A', capital: 'A', region: 'X', lat: 1, lng: 1 },
    { code: 'BBB', code2: 'BB', name: 'B', namePt: 'B', capital: 'B', region: 'X', lat: 2, lng: 2 },
  ];
  const results = await weatherService.getWeatherForCountries(countries);

  assert.equal(results.length, 2);
  assert.equal(results[0].weather.temperature, 10);
  assert.equal(results[1].weather.temperature, 30);
});

test('erro de rede em um lote vira resultado de erro por país, sem lançar exceção', async () => {
  global.fetch = async () => {
    throw new Error('rede indisponível');
  };

  delete require.cache[require.resolve('../src/services/weatherService')];
  const weatherService = require('../src/services/weatherService');

  const countries = [
    { code: 'AAA', code2: 'AA', name: 'A', namePt: 'A', capital: 'A', region: 'X', lat: 1, lng: 1 },
  ];
  const results = await weatherService.getWeatherForCountries(countries);

  assert.equal(results.length, 1);
  assert.equal(results[0].weather, null);
  assert.match(results[0].error, /rede indisponível/);
});

test('resposta HTTP não-OK vira resultado de erro, sem lançar exceção', async () => {
  global.fetch = async () => ({ ok: false, status: 503 });

  delete require.cache[require.resolve('../src/services/weatherService')];
  const weatherService = require('../src/services/weatherService');

  const country = { code: 'AAA', code2: 'AA', name: 'A', namePt: 'A', capital: 'A', region: 'X', lat: 1, lng: 1 };
  const result = await weatherService.getWeatherForCountry(country);

  assert.equal(result.weather, null);
  assert.match(result.error, /503/);
});

test('resposta HTTP não-OK em lote vira resultado de erro por país, sem lançar exceção', async () => {
  global.fetch = async () => ({ ok: false, status: 503 });

  delete require.cache[require.resolve('../src/services/weatherService')];
  const weatherService = require('../src/services/weatherService');

  const countries = [
    { code: 'AAA', code2: 'AA', name: 'A', namePt: 'A', capital: 'A', region: 'X', lat: 1, lng: 1 },
    { code: 'BBB', code2: 'BB', name: 'B', namePt: 'B', capital: 'B', region: 'X', lat: 2, lng: 2 },
  ];
  const results = await weatherService.getWeatherForCountries(countries);

  assert.equal(results.length, 2);
  assert.equal(results[0].weather, null);
  assert.equal(results[1].weather, null);
  assert.match(results[0].error, /503/);
  assert.match(results[1].error, /503/);
});

const weatherCodeDescriptions = {
  0: 'Predominantemente limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Neblina com depósito de gelo',
  51: 'Chuvisco leve',
  53: 'Chuvisco moderado',
  55: 'Chuvisco intenso',
  56: 'Chuva congelante leve',
  57: 'Chuva congelante intensa',
  61: 'Chuva leve',
  63: 'Chuva moderada',
  65: 'Chuva intensa',
  66: 'Chuva congelante leve',
  67: 'Chuva congelante intensa',
  71: 'Neve leve',
  73: 'Neve moderada',
  75: 'Neve intensa', 
  77: 'Granizo',
  80: 'Chuva de intensidade variável',
  81: 'Chuva de intensidade variável',
  82: 'Chuva de intensidade variável',
  85: 'Neve de intensidade variável',
  86: 'Neve de intensidade variável',
  95: 'Tempestade com chuva e trovoadas',
  96: 'Tempestade com granizo leve',
  99: 'Tempestade com granizo intenso',
};

test('getWeatherForCountry mapeia corretamente o código de clima para descrição', async () => {
  global.fetch = async () => ({
    ok: true,
    json: async () => mockCurrentResponse({ weather_code: 63 }),
  });

  delete require.cache[require.resolve('../src/services/weatherService')];
  const weatherService = require('../src/services/weatherService');

  const country = { code: 'BRA', code2: 'BR', name: 'Brazil', namePt: 'Brasil', capital: 'Brasília', region: 'Americas', subregion: 'South America', flag: '🇧🇷', lat: -15.79, lng: -47.88 };
  const result = await weatherService.getWeatherForCountry(country);

  assert.equal(result.weather.description, weatherCodeDescriptions[63]);
});
