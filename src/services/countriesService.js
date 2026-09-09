const countries = require('../data/countries.json');

/**
 * Os dados de países (nome, capital, coordenadas, região) vêm de um
 * dataset estático embutido no projeto (src/data/countries.json),
 * gerado a partir do mledoze/countries (ISO 3166-1, licença ODbL).
 *
 * Optamos por um arquivo estático em vez de consultar uma API de países
 * em tempo real porque a REST Countries (a opção mais usada nesse tipo
 * de projeto) descontinuou a v3.1 e a v5 exige chave de API com cota
 * mensal baixa. Dados de país/capital/coordenadas mudam raramente, então
 * um arquivo estático é mais simples e não depende de terceiros no ar.
 */

function getAllCountries({ region, search } = {}) {
  let result = countries;

  if (region) {
    const regionLower = region.toLowerCase();
    result = result.filter((c) => (c.region || '').toLowerCase() === regionLower);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.namePt.toLowerCase().includes(searchLower) ||
        (c.capital || '').toLowerCase().includes(searchLower)
    );
  }

  return result;
}

function getCountryByCode(code) {
  if (!code) return null;
  const codeUpper = code.toUpperCase();
  return countries.find((c) => c.code === codeUpper || c.code2 === codeUpper) || null;
}

function getRegions() {
  return [...new Set(countries.map((c) => c.region).filter(Boolean))].sort();
}

module.exports = { getAllCountries, getCountryByCode, getRegions };
