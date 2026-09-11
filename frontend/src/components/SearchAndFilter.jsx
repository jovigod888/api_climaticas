import styles from './SearchAndFilter.module.css';

const REGION_LABELS = {
  Africa: 'África',
  Americas: 'Américas',
  Asia: 'Ásia',
  Europe: 'Europa',
  Oceania: 'Oceania',
  Antarctic: 'Antártida',
};

export function SearchAndFilter({ search, onSearchChange, regions, selectedRegion, onRegionChange }) {
  return (
    <div className={styles.wrap}>
      <input
        type="search"
        className={styles.search}
        placeholder="Buscar país ou capital"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        aria-label="Buscar país ou capital"
      />

      <div className={styles.pills} role="group" aria-label="Filtrar por região">
        <button
          type="button"
          className={selectedRegion === '' ? styles.pillActive : styles.pill}
          onClick={() => onRegionChange('')}
        >
          Todas
        </button>
        {regions.map((region) => (
          <button
            key={region}
            type="button"
            className={selectedRegion === region ? styles.pillActive : styles.pill}
            onClick={() => onRegionChange(region)}
          >
            {REGION_LABELS[region] || region}
          </button>
        ))}
      </div>
    </div>
  );
}
