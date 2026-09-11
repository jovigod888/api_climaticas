import { useCallback, useEffect, useState } from 'react';
import { fetchAllWeather } from '../api/weather';

/**
 * Busca o clima de todos os países uma vez, e mantém em estado local.
 * Busca/filtro por região acontecem no cliente (useCountryFilter), em
 * cima dessa lista — assim digitar na busca não gera nenhuma requisição nova.
 */
export function useWeather() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const payload = await fetchAllWeather({ refresh });
      setCountries(payload.weather);
      setUpdatedAt(payload.updatedAt);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar o clima agora.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  return {
    countries,
    loading,
    refreshing,
    error,
    updatedAt,
    refresh: () => load(true),
  };
}

export function useCountryFilter(countries, { search, region }) {
  return countries.filter((country) => {
    if (search && !country.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (region && country.region !== region) {
      return false;
    }
    return true;
  });
}

