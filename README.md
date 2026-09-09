# api_climaticas 🌍🌦️

API em Node.js/Express que retorna o **clima atual de todos os países do mundo** (~250 países e territórios). Sem necessidade de chave de API.

## Como funciona

- **Países** (nome, capital, coordenadas, região): vêm de um arquivo estático embutido no projeto (`src/data/countries.json`), gerado a partir do [mledoze/countries](https://github.com/mledoze/countries) (ISO 3166-1).
- **Clima**: buscado em tempo real na [Open-Meteo](https://open-meteo.com/), gratuita e sem chave de API.

> **Por que um arquivo estático para os países, e não uma API de países em tempo real?**
> A opção mais comum para isso é a REST Countries, mas a versão gratuita e sem chave (v3.1) foi **descontinuada** pelo provedor — a v5 atual exige cadastro e chave de API, com cota gratuita de apenas 500 requisições/mês. Como dados de país/capital/coordenadas praticamente não mudam, um arquivo estático é mais simples, mais rápido e não depende de um serviço externo (nem de chave) só para isso. Se no futuro você preferir buscar esses dados de outro lugar, é só trocar o `src/services/countriesService.js`.

## Instalação

```bash
npm install
```

## Como rodar

```bash
npm start           # produção
npm run dev          # desenvolvimento, reinicia sozinho ao salvar (node --watch)
```

Por padrão sobe em `http://localhost:3000`. Para mudar a porta ou outros ajustes, copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

| Variável | Padrão | O que faz |
|---|---|---|
| `PORT` | `3000` | Porta do servidor |
| `CACHE_TTL_SECONDS` | `600` (10 min) | Por quanto tempo o clima de cada consulta fica em cache antes de buscar de novo na Open-Meteo |
| `WEATHER_BATCH_SIZE` | `40` | Quantos países são consultados por requisição em lote à Open-Meteo |
| `WEATHER_BATCH_CONCURRENCY` | `4` | Quantos lotes rodam em paralelo ao consultar todos os países |

## Endpoints

### `GET /api/countries`
Lista todos os países (sem clima). Aceita `?region=Europe` e/ou `?search=brasil` (busca por nome em PT/EN ou capital).

### `GET /api/countries/regions`
Lista as regiões disponíveis (`Africa`, `Americas`, `Asia`, `Europe`, `Oceania`, `Antarctic`), para popular filtros na interface.

### `GET /api/countries/:code`
Dados de um país específico. `:code` pode ser o código ISO alpha-2 (`BR`) ou alpha-3 (`BRA`), maiúsculo ou minúsculo.

### `GET /api/weather`
Clima atual de **todos os países** (ou de um subconjunto, com os mesmos filtros de `/api/countries`: `?region=` e `?search=`). Essa é a rota principal.

- `?refresh=true` ignora o cache e busca tudo de novo na hora.

```json
{
  "total": 250,
  "updatedAt": "2026-09-09T21:40:00.000Z",
  "cached": false,
  "weather": [
    {
      "code": "BRA",
      "code2": "BR",
      "name": "Brazil",
      "namePt": "Brasil",
      "capital": "Brasília",
      "region": "Americas",
      "subregion": "South America",
      "flag": "🇧🇷",
      "lat": -10,
      "lng": -55,
      "weather": {
        "temperature": 28.3,
        "apparentTemperature": 29.1,
        "humidity": 60,
        "precipitation": 0,
        "windSpeed": 12.1,
        "windDirection": 90,
        "isDay": true,
        "weatherCode": 3,
        "description": "Nublado",
        "icon": "☁️",
        "observedAt": "2026-09-09T18:30"
      },
      "units": { "temperature": "°C", "windSpeed": "km/h", "precipitation": "mm" },
      "error": null
    }
  ]
}
```

Se a Open-Meteo falhar para algum país (timeout, instabilidade, etc.), aquele item vem com `"weather": null` e um `"error"` explicando o motivo — o resto da lista continua normalmente, um país com problema não derruba a requisição inteira.

### `GET /api/weather/:code`
Clima atual de um único país (mesmo formato de item acima, mais `cached` e `updatedAt`).

## Testes

```bash
npm test
```

Os testes usam o executor de testes nativo do Node (`node --test`, sem dependências extras) e mockam o `fetch` para validar o parsing das respostas da Open-Meteo — tanto o formato de localização única quanto o de lote (várias coordenadas em uma única requisição) — e o tratamento de erros (timeout, rede fora do ar, HTTP não-OK), sem depender de internet para rodar.

## Sobre os dados de clima

A Open-Meteo devolve o clima do ponto geográfico de cada país (`lat`/`lng` do dataset, aproximadamente o centro geográfico do país). Unidades: temperatura em °C, vento em km/h, precipitação em mm.

## Próximos passos

Este é o backend. A ideia é usar essa API como base para montar a interface gráfica na sequência.
