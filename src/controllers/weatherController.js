const countriesService = require('../services/countriesService');
const weatherService = require('../services/weatherService');
const { TTLCache } = require('../utils/cache');

const CACHE_TTL_MS = (Number(process.env.CACHE_TTL_SECONDS) || 600) * 1000;
const weatherCache = new TTLCache(CACHE_TTL_MS);

function listCountries(req, res) {
  const { region, search } = req.query;
  const countries = countriesService.getAllCountries({ region, search });
  res.json({ total: countries.length, countries });
}

function listRegions(req, res) {
  res.json({ regions: countriesService.getRegions() });
}

function getCountry(req, res) {
  const country = countriesService.getCountryByCode(req.params.code);
  if (!country) {
    return res.status(404).json({ error: `País com código "${req.params.code}" não encontrado.` });
  }
  res.json(country);
}

async function getWeatherForAll(req, res, next) {
  try {
    const { region, search, refresh } = req.query;
    const countries = countriesService.getAllCountries({ region, search });

    if (countries.length === 0) {
      return res.json({ total: 0, updatedAt: new Date().toISOString(), cached: false, weather: [] });
    }

    const cacheKey = `all:${region || ''}:${search || ''}`;

    if (refresh !== 'true') {
      const cached = weatherCache.get(cacheKey);
      if (cached) {
        return res.json({ ...cached, cached: true });
      }
    }

    const weather = await weatherService.getWeatherForCountries(countries);
    const payload = {
      total: weather.length,
      updatedAt: new Date().toISOString(),
      cached: false,
      weather,
    };

    weatherCache.set(cacheKey, payload);
    res.json(payload);
  } catch (error) {
    next(error);
  }
}

async function getWeatherForOne(req, res, next) {
  try {
    const country = countriesService.getCountryByCode(req.params.code);
    if (!country) {
      return res.status(404).json({ error: `País com código "${req.params.code}" não encontrado.` });
    }

    const cacheKey = `one:${country.code}`;
    if (req.query.refresh !== 'true') {
      const cached = weatherCache.get(cacheKey);
      if (cached) {
        return res.json({ ...cached, cached: true });
      }
    }

    const result = await weatherService.getWeatherForCountry(country);
    const payload = { ...result, cached: false, updatedAt: new Date().toISOString() };

    weatherCache.set(cacheKey, payload);
    res.json(payload);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listCountries,
  listRegions,
  getCountry,
  getWeatherForAll,
  getWeatherForOne,
};
