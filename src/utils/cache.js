/**
 * Cache simples em memória com expiração (TTL).
 * Suficiente para uma API de clima: evita bater na Open-Meteo a cada
 * requisição, já que o clima não muda de um minuto para o outro.
 *
 * Não é distribuído nem persistente — reinicia toda vez que o processo
 * reinicia. Para múltiplas instâncias em produção, troque por Redis.
 */
class TTLCache {
  constructor(defaultTtlMs) {
    this.defaultTtlMs = defaultTtlMs;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

module.exports = { TTLCache };
