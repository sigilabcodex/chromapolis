import { FormEvent, useMemo, useState } from 'react';
import type { City } from '../types/chromapolis';

interface CitySearchProps {
  cities: City[];
  selectedCitySlug: string;
  onSelectCity: (slug: string) => void;
}

export function CitySearch({ cities, selectedCitySlug, onSelectCity }: CitySearchProps) {
  const [query, setQuery] = useState('');

  const filteredCities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return cities;
    }

    return cities.filter((city) => {
      const searchable = [city.name, city.country, city.countryCode, city.region]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [cities, query]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (filteredCities.length > 0) {
      onSelectCity(filteredCities[0].slug);
    }
  }

  return (
    <form className="city-search" onSubmit={onSubmit}>
      <label htmlFor="city-query">Search city palettes</label>
      <div className="search-row">
        <input
          id="city-query"
          name="cityQuery"
          type="search"
          placeholder="Try: Lisbon, Tokyo, Nairobi..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit" disabled={filteredCities.length === 0}>
          Search
        </button>
      </div>

      <label className="select-label" htmlFor="city-select">
        Available cities
      </label>
      <select
        id="city-select"
        value={selectedCitySlug}
        onChange={(event) => onSelectCity(event.target.value)}
        disabled={cities.length === 0}
      >
        {cities.length === 0 ? (
          <option value="">No valid cities loaded</option>
        ) : filteredCities.length === 0 ? (
          <option value={selectedCitySlug}>No matching cities</option>
        ) : (
          filteredCities.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.name}, {city.country}
            </option>
          ))
        )}
      </select>

      <p className="search-help" aria-live="polite">
        {cities.length === 0
          ? 'No valid city records are available yet.'
          : `${filteredCities.length} of ${cities.length} city record${cities.length === 1 ? '' : 's'} shown.`}
      </p>
    </form>
  );
}
