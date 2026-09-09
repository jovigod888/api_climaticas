/**
 * Tabela de códigos de clima WMO (WMO Weather interpretation codes),
 * o mesmo padrão usado pela Open-Meteo no campo "weather_code".
 * Referência: https://open-meteo.com/en/docs
 */
const WEATHER_CODES = {
  0: { description: 'Céu limpo', icon: '☀️' },
  1: { description: 'Predominantemente limpo', icon: '🌤️' },
  2: { description: 'Parcialmente nublado', icon: '⛅' },
  3: { description: 'Nublado', icon: '☁️' },
  45: { description: 'Nevoeiro', icon: '🌫️' },
  48: { description: 'Nevoeiro com formação de geada', icon: '🌫️' },
  51: { description: 'Garoa leve', icon: '🌦️' },
  53: { description: 'Garoa moderada', icon: '🌦️' },
  55: { description: 'Garoa densa', icon: '🌧️' },
  56: { description: 'Garoa congelante leve', icon: '🌧️' },
  57: { description: 'Garoa congelante densa', icon: '🌧️' },
  61: { description: 'Chuva leve', icon: '🌦️' },
  63: { description: 'Chuva moderada', icon: '🌧️' },
  65: { description: 'Chuva forte', icon: '🌧️' },
  66: { description: 'Chuva congelante leve', icon: '🌧️' },
  67: { description: 'Chuva congelante forte', icon: '🌧️' },
  71: { description: 'Neve leve', icon: '🌨️' },
  73: { description: 'Neve moderada', icon: '🌨️' },
  75: { description: 'Neve forte', icon: '❄️' },
  77: { description: 'Grãos de neve', icon: '❄️' },
  80: { description: 'Pancadas de chuva leves', icon: '🌦️' },
  81: { description: 'Pancadas de chuva moderadas', icon: '🌧️' },
  82: { description: 'Pancadas de chuva violentas', icon: '⛈️' },
  85: { description: 'Pancadas de neve leves', icon: '🌨️' },
  86: { description: 'Pancadas de neve fortes', icon: '❄️' },
  95: { description: 'Trovoada', icon: '⛈️' },
  96: { description: 'Trovoada com granizo leve', icon: '⛈️' },
  99: { description: 'Trovoada com granizo forte', icon: '⛈️' },
};

/**
 * Retorna a descrição em português e o ícone para um weather_code da Open-Meteo.
 * @param {number} code
 * @returns {{description: string, icon: string}}
 */
function describeWeatherCode(code) {
  return WEATHER_CODES[code] || { description: 'Condição desconhecida', icon: '❓' };
}

module.exports = { describeWeatherCode, WEATHER_CODES };
