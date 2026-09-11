import { useMemo, useState } from 'react';
import { useWeather } from './hooks/useWeather';
import { extractRegions, filterCountries } from './utils/filterCountries';
import { Header } from './components/Header';
import { SearchAndFilter } from './components/SearchAndFilter';
import { CountryGrid } from './components/CountryGrid';
import styles from './App.module.css';

export default function App() {
  const { countries, loading, refreshing, error, updatedAt, refresh } = useWeather();
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');

  const regions = useMemo(() => extractRegions(countries), [countries]);
  const filtered = useMemo(
    () => filterCountries(countries, { search, region }),
    [countries, search, region]
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Header
          total={countries.length}
          updatedAt={updatedAt}
          onRefresh={refresh}
          refreshing={refreshing}
        />

        <SearchAndFilter
          search={search}
          onSearchChange={setSearch}
          regions={regions}
          selectedRegion={region}
          onRegionChange={setRegion}
        />

        <CountryGrid countries={filtered} loading={loading} error={error} search={search} />
      </div>
    </div>
  );
}
