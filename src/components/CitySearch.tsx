import { FormEvent, useMemo, useState } from 'react';
import type { City } from '../types/chromapolis';

interface CitySearchProps {
  cities: City[];
  selectedCitySlug: string;
  onSelectCity: (slug: string) => void;
}

export function CitySearch({ cities, selectedCitySlug, onSelectCity }: CitySearchProps) {
  const [query, setQuery] = useState('');

  const sortedCities = useMemo(
    () =>
      [...cities].sort((a, b) =>
        `${a.name}, ${a.country}`.localeCompare(`${b.name}, ${b.country}`),
      ),
    [cities],
  );

  const filteredCities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return sortedCities;
    }

    return sortedCities.filter((city) => {
      const searchable = [city.name, city.country, city.countryCode, city.region]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [query, sortedCities]);

  const selectedCityIsVisible = filteredCities.some((city) => city.slug === selectedCitySlug);
  const selectValue = selectedCityIsVisible ? selectedCitySlug : '';

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
        Available cities ({cities.length})
      </label>
      <select
        id="city-select"
        value={selectValue}
        onChange={(event) => {
          if (event.target.value) {
            onSelectCity(event.target.value);
          }
        }}
        disabled={cities.length === 0}
      >
        {cities.length === 0 ? (
          <option value="">No valid cities loaded</option>
        ) : filteredCities.length === 0 ? (
          <option value="">No matching cities</option>
        ) : (
          <>
            {!selectedCityIsVisible ? <option value="">Select a matching city</option> : null}
            {filteredCities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}, {city.countryCode} — {city.country}
              </option>
            ))}
          </>
        )}
      </select>

      <p className="search-help" aria-live="polite">
        {cities.length === 0
          ? 'No valid city records are available yet.'
          : `${filteredCities.length} of ${cities.length} city record${cities.length === 1 ? '' : 's'} shown. Use search to filter by city, country, code, or region.`}
      </p>
    </form>
  );
}
