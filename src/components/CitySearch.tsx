import { FormEvent, useState } from 'react';

export function CitySearch() {
  const [query, setQuery] = useState('');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Future integration: wire this search form to a local dataset in /data.
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
        <button type="submit">Search</button>
      </div>
    </form>
  );
}
