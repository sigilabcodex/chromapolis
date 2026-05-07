import { useMemo, useState } from 'react';
import { CitySearch } from '../components/CitySearch';
import { PalettePanel } from '../components/PalettePanel';
import { ComparisonPanel } from '../components/ComparisonPanel';
import { ExploreSection } from '../components/ExploreSection';
import { getAllCities, getDataLoadDiagnostics } from '../lib/dataLoader';

export function HomePage() {
  const cities = useMemo(() => getAllCities(), []);
  const diagnostics = useMemo(() => getDataLoadDiagnostics(), []);
  const [selectedCitySlug, setSelectedCitySlug] = useState(cities[0]?.slug ?? '');
  const [activeView, setActiveView] = useState<'explore' | 'compare'>('explore');
  const selectedCity = cities.find((city) => city.slug === selectedCitySlug) ?? cities[0] ?? null;

  return (
    <main className="layout">
      <header className="hero">
        <p className="kicker">Chromapolis</p>
        <h1>A Chromatic Atlas of Cities</h1>
        <p>
          Discover conceptual urban palettes inspired by neighborhoods, architecture,
          light, and materials. The initial MVP is intentionally static-first and
          privacy-respecting.
        </p>
        <CitySearch
          cities={cities}
          selectedCitySlug={selectedCity?.slug ?? ''}
          onSelectCity={setSelectedCitySlug}
        />
      </header>

      <nav className="view-tabs" aria-label="Palette workspace">
        <button
          type="button"
          className={activeView === 'explore' ? 'active' : ''}
          onClick={() => setActiveView('explore')}
        >
          Explore
        </button>
        <button
          type="button"
          className={activeView === 'compare' ? 'active' : ''}
          onClick={() => setActiveView('compare')}
        >
          Compare
        </button>
      </nav>

      {activeView === 'explore' ? (
        <section className="grid">
          <ExploreSection cities={cities} selectedCity={selectedCity} diagnostics={diagnostics} />
          <PalettePanel city={selectedCity} />
        </section>
      ) : (
        <ComparisonPanel cities={cities} />
      )}
    </main>
  );
}
