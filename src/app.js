const express = require('express');
const cors = require('cors');
const weatherRoutes = require('./routes/weatherRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    nome: 'API Climáticas',
    descricao: 'Clima atual de todos os países do mundo.',
    endpoints: {
      'GET /api/countries': 'Lista todos os países (?region=Europe&search=bra)',
      'GET /api/countries/regions': 'Lista as regiões disponíveis',
      'GET /api/countries/:code': 'Dados de um país (código ISO alpha-2 ou alpha-3, ex: BR ou BRA)',
      'GET /api/weather': 'Clima atual de todos os países (?region=&search=&refresh=true)',
      'GET /api/weather/:code': 'Clima atual de um país específico',
    },
  });
});

app.use('/api', weatherRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
