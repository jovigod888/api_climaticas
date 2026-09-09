const { Router } = require('express');
const controller = require('../controllers/weatherController');

const router = Router();

// Metadados dos países (sem clima) — nome, capital, coordenadas, região...
router.get('/countries', controller.listCountries);
router.get('/countries/regions', controller.listRegions);
router.get('/countries/:code', controller.getCountry);

// Clima atual — o principal da API
router.get('/weather', controller.getWeatherForAll);
router.get('/weather/:code', controller.getWeatherForOne);

module.exports = router;
