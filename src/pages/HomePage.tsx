import { CitySearch } from '../components/CitySearch';
import { PalettePanel } from '../components/PalettePanel';
import { ExploreSection } from '../components/ExploreSection';

export function HomePage() {
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
        <CitySearch />
      </header>

      <section className="grid">
        <ExploreSection />
        <PalettePanel />
      </section>
    </main>
  );
}
