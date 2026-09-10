const test = require('node:test');
const assert = require('node:assert/strict');
const countriesService = require('../src/services/countriesService');

test('getAllCountries retorna todos os países sem filtro', () => {
  const countries = countriesService.getAllCountries();
  assert.ok(countries.length > 190, 'deveria ter mais de 190 países/territórios');
});

test('getAllCountries filtra por região', () => {
  const countries = countriesService.getAllCountries({ region: 'Europe' });
  assert.ok(countries.length > 0);
  assert.ok(countries.every((c) => c.region === 'Europe'));
});

test('getAllCountries filtra por busca (nome em português)', () => {
  const countries = countriesService.getAllCountries({ search: 'brasil' });
  assert.ok(countries.some((c) => c.code === 'BRA'));
});

test('getCountryByCode encontra por código alpha-3', () => {
  const brasil = countriesService.getCountryByCode('BRA');
  assert.equal(brasil.name, 'Brazil');
  assert.equal(brasil.capital, 'Brasília');
});

test('getCountryByCode encontra por código alpha-2 (case insensitive)', () => {
  const brasil = countriesService.getCountryByCode('br');
  assert.equal(brasil.code, 'BRA');
});

test('getCountryByCode retorna null para código inexistente', () => {
  assert.equal(countriesService.getCountryByCode('XX'), null);
});

test('getRegions retorna lista de regiões sem duplicatas', () => {
  const regions = countriesService.getRegions();
  assert.equal(new Set(regions).size, regions.length);
  assert.ok(regions.includes('Americas'));
});
