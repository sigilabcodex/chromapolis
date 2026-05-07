import { VisualAtlas } from './VisualAtlas';
import type { DataLoadDiagnostics } from '../lib/dataLoader';
import type { City } from '../types/chromapolis';

interface ExploreSectionProps {
  cities: City[];
  selectedCity: City | null;
  diagnostics: DataLoadDiagnostics;
  onSelectCity: (slug: string) => void;
}

export function ExploreSection({ cities, selectedCity, diagnostics, onSelectCity }: ExploreSectionProps) {
  const hasDiagnostics = diagnostics.errors.length > 0;

  return (
    <section className="panel" aria-labelledby="explore-heading">
      <h2 id="explore-heading">Visual Atlas</h2>
      <p>
        Browse the manifest-driven city dataset on a lightweight static world-plane atlas.
        Markers use each record's latitude and longitude and update the palette viewer when selected.
      </p>

      <VisualAtlas cities={cities} selectedCity={selectedCity} onSelectCity={onSelectCity} />

      <dl className="dataset-summary">
        <div>
          <dt>Valid cities</dt>
          <dd>{cities.length}</dd>
        </div>
        <div>
          <dt>Selected</dt>
          <dd>{selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : 'None'}</dd>
        </div>
      </dl>

      {selectedCity ? (
        <div className="city-summary">
          <h3>{selectedCity.name}</h3>
          <p>{selectedCity.editorialSummary}</p>
          <p className="city-meta">
            {selectedCity.region ? `${selectedCity.region} · ` : ''}
            {selectedCity.countryCode} · {selectedCity.palette.length} colors · {selectedCity.sources.length} sources
          </p>
        </div>
      ) : null}

      <div className={hasDiagnostics ? 'data-health data-health-warning' : 'data-health'} role="status">
        <strong>{hasDiagnostics ? 'Dataset needs attention' : 'Dataset loaded'}</strong>
        <p>
          {hasDiagnostics
            ? `${diagnostics.loadedEntries} records loaded; ${diagnostics.invalidEntries} manifest entries failed validation.`
            : `${diagnostics.loadedEntries} records loaded with no loader diagnostics.`}
        </p>
        {hasDiagnostics ? (
          <ul>
            {diagnostics.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
