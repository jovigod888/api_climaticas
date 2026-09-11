/**
 * Filtra a lista de países já carregada — por região e/ou por um termo de
 * busca (nome em PT/EN ou capital). Tudo no cliente, sem nova requisição.
 */
export function filterCountries(countries, { search = '', region = '' } = {}) {
  const term = search.trim().toLowerCase();

  return countries.filter((country) => {
    if (region && country.region !== region) return false;
    if (!term) return true;
    return (
      country.namePt.toLowerCase().includes(term) ||
      country.name.toLowerCase().includes(term) ||
      (country.capital || '').toLowerCase().includes(term)
    );
  });
}

/** Lista de regiões presentes nos países carregados, em ordem alfabética. */
export function extractRegions(countries) {
  return [...new Set(countries.map((c) => c.region).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'pt')
  );
}


export function extractSubregions(countries) {
  return [...new Set(countries.map((c) => c.subregion).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'pt')
  );
}

