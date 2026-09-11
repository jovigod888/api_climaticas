import { CountryTile } from './CountryTile';
import styles from './CountryGrid.module.css';

export function CountryGrid({ countries, loading, error, search }) {
  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={styles.skeleton} aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.message}>
        <p>Não deu para carregar o clima agora.</p>
        <p className={styles.detail}>{error}</p>
      </div>
    );
  }

  if (countries.length === 0) {
    return (
      <div className={styles.message}>
        <p>Nenhum país encontrado{search ? ` para "${search}"` : ''}.</p>
        <p className={styles.detail}>Tenta outro nome, ou limpa a busca e o filtro de região.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {countries.map((country) => (
        <CountryTile key={country.code} country={country} />
      ))}
    </div>
  );
}
