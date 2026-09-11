import { temperatureColor } from '../utils/temperatureColor';
import styles from './CountryTile.module.css';

export function CountryTile({ country }) {
  const { namePt, capital, flag, weather, error } = country;
  const accent = weather ? temperatureColor(weather.temperature) : 'var(--line-strong)';

  return (
    <article className={styles.tile} style={{ '--accent': accent }}>
      <div className={styles.bar} />
      <header className={styles.head}>
        <span className={styles.flag} aria-hidden="true">
          {flag}
        </span>
        <div>
          <h3 className={styles.name}>{namePt}</h3>
          {capital && <p className={styles.capital}>{capital}</p>}
        </div>
      </header>

      {weather ? (
        <>
          <p className={styles.temp}>
            {Math.round(weather.temperature)}
            <span className={styles.unit}>°C</span>
          </p>
          <p className={styles.condition}>
            <span aria-hidden="true">{weather.icon}</span> {weather.description}
          </p>
          <dl className={styles.stats}>
            <div className={styles.stat}>
              <dt>umidade</dt>
              <dd>{weather.humidity ?? '—'}%</dd>
            </div>
            <div className={styles.stat}>
              <dt>vento</dt>
              <dd>{weather.windSpeed != null ? `${Math.round(weather.windSpeed)} km/h` : '—'}</dd>
            </div>
          </dl>
        </>
      ) : (
        <p className={styles.noData}>Sem dados de clima agora{error ? '.' : ''}</p>
      )}
    </article>
  );
}


