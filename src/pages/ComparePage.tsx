import { useEffect, useMemo, useState } from 'react';
import { getAllCities } from '../lib/dataLoader';
import { compareCities, comparisonToCssVariables, comparisonToMarkdown } from '../lib/compare';

const MIN_CITIES = 2;
const MAX_CITIES = 4;

function parseSlugsFromQuery(allSlugs: string[]): string[] {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('cities');
  if (!raw) {
    return [];
  }

  const deduped = Array.from(
    new Set(
      raw
        .split(',')
        .map((slug) => slug.trim().toLowerCase())
        .filter((slug) => allSlugs.includes(slug)),
    ),
  );

  return deduped.slice(0, MAX_CITIES);
}

function triggerDownload(content: string, fileName: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ComparePage() {
  const allCities = useMemo(() => getAllCities().sort((a, b) => a.name.localeCompare(b.name)), []);
  const allSlugs = useMemo(() => allCities.map((city) => city.slug), [allCities]);

  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(() => {
    const fromQuery = parseSlugsFromQuery(allSlugs);
    if (fromQuery.length > 0) {
      return fromQuery;
    }
    if (allCities.length >= MIN_CITIES) {
      return allCities.slice(0, MIN_CITIES).map((city) => city.slug);
    }
    return [];
  });

  const selectedCities = useMemo(
    () => selectedSlugs.map((slug) => allCities.find((city) => city.slug === slug)).filter((city) => city !== undefined),
    [allCities, selectedSlugs],
  );

  const comparison = useMemo(
    () => (selectedCities.length >= MIN_CITIES ? compareCities(selectedCities) : null),
    [selectedCities],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedSlugs.length > 0) {
      params.set('cities', selectedSlugs.join(','));
    } else {
      params.delete('cities');
    }
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState({}, '', nextUrl);
  }, [selectedSlugs]);

  function toggleCity(slug: string) {
    const isSelected = selectedSlugs.includes(slug);

    if (isSelected) {
      if (selectedSlugs.length <= MIN_CITIES) {
        return;
      }
      setSelectedSlugs(selectedSlugs.filter((value) => value !== slug));
      return;
    }

    if (selectedSlugs.length >= MAX_CITIES) {
      return;
    }

    setSelectedSlugs([...selectedSlugs, slug]);
  }

  function exportJson() {
    if (!comparison) {
      return;
    }

    const payload = {
      ...comparison.exportPayload,
      cities: selectedCities,
      result: comparison,
    };

    triggerDownload(
      `${JSON.stringify(payload, null, 2)}\n`,
      `chromapolis-compare-${comparison.exportPayload.citySlugs.join('-')}.json`,
      'application/json',
    );
  }

  function exportMarkdown() {
    if (!comparison) {
      return;
    }

    triggerDownload(
      `${comparisonToMarkdown(comparison)}\n`,
      `chromapolis-compare-${comparison.exportPayload.citySlugs.join('-')}.md`,
      'text/markdown',
    );
  }

  function exportCss() {
    if (!comparison) {
      return;
    }

    triggerDownload(
      `${comparisonToCssVariables(comparison, selectedCities)}\n`,
      `chromapolis-compare-${comparison.exportPayload.citySlugs.join('-')}.css`,
      'text/css',
    );
  }

  const insufficientDataset = allCities.length < MIN_CITIES;

  return (
    <main className="layout">
      <header className="hero">
        <p className="kicker">Compare Cities</p>
        <h1>Comparative palette atlas</h1>
        <p>
          Select between two and four cities to inspect side-by-side color systems, near chromatic
          correspondences, contrast relationships, and shared semantic layers.
        </p>
      </header>

      <section className="panel" aria-labelledby="compare-select-heading">
        <h2 id="compare-select-heading">1) Select 2–4 cities</h2>
        {insufficientDataset ? (
          <p>Comparison requires at least two city records in the dataset.</p>
        ) : (
          <>
            <div className="city-options" role="group" aria-label="City selection">
              {allCities.map((city) => {
                const checked = selectedSlugs.includes(city.slug);
                const disabled = (!checked && selectedSlugs.length >= MAX_CITIES) || (checked && selectedSlugs.length <= MIN_CITIES);

                return (
                  <label className="city-option" key={city.slug}>
                    <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggleCity(city.slug)} />
                    <span>
                      {city.name}, {city.countryCode}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="selection-note">Deep link: /compare?cities={selectedSlugs.join(',')}</p>
          </>
        )}
      </section>

      {comparison ? (
        <>
          <section className="panel" aria-labelledby="side-by-side-heading">
            <h2 id="side-by-side-heading">2) Side-by-side palettes</h2>
            <div className="compare-grid">
              {selectedCities.map((city) => {
                const confidenceEntry = comparison.confidenceProfile.find((entry) => entry.citySlug === city.slug);

                return (
                  <article className="compare-city-card" key={city.slug}>
                    <h3>{city.name}</h3>
                    <p>{city.country}{city.region ? ` · ${city.region}` : ''}</p>
                    <p className="editorial-summary">{city.editorialSummary}</p>
                    {confidenceEntry ? <p className={`tag status status-${confidenceEntry.status}`}>Data status: {confidenceEntry.status}</p> : null}
                    <ul className="swatches" aria-label={`${city.name} palette`}>
                      {city.palette.map((color) => (
                        <li key={`${city.slug}-${color.hex}`}>
                          <span className="swatch" style={{ background: color.hex }} aria-hidden="true" />
                          <div>
                            <code>{color.hex}</code>
                            <div className="swatch-meta">
                              <span>{color.name}</span>
                              <span className="tag">{color.layer}</span>
                              <span className="tag">conf {Math.round(color.confidence * 100)}%</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="grid compare-insights">
            <section className="panel" aria-labelledby="correspondence-heading">
              <h2 id="correspondence-heading">3) Near chromatic correspondences</h2>
              <ul className="insight-list">
                {comparison.nearChromaticCorrespondences.length === 0 ? (
                  <li>No near correspondences within ΔE ≤ 18 for this selection.</li>
                ) : (
                  comparison.nearChromaticCorrespondences.map((match, index) => {
                    const [a, b] = match.pair;
                    return (
                      <li key={`${a.citySlug}-${b.citySlug}-match-${index}`}>
                        {a.cityName} {a.name} ({a.hex}) ↔ {b.cityName} {b.name} ({b.hex}) · ΔE {match.deltaE.toFixed(1)}
                      </li>
                    );
                  })
                )}
              </ul>
            </section>

            <section className="panel" aria-labelledby="contrast-heading">
              <h2 id="contrast-heading">4) Strong contrasts</h2>
              <ul className="insight-list">
                {comparison.strongestContrasts.length === 0 ? (
                  <li>No contrast relationships detected.</li>
                ) : (
                  comparison.strongestContrasts.slice(0, 8).map((contrast, index) => {
                    const [a, b] = contrast.pair;
                    return (
                      <li key={`${a.citySlug}-${b.citySlug}-contrast-${index}`}>
                        {a.cityName} {a.hex} vs {b.cityName} {b.hex} · contrast ratio {contrast.contrastRatio.toFixed(2)}
                      </li>
                    );
                  })
                )}
              </ul>
            </section>
          </section>

          <section className="panel" aria-labelledby="layers-heading">
            <h2 id="layers-heading">5) Shared palette layers</h2>
            <ul className="insight-list">
              {comparison.sharedLayers.length === 0 ? (
                <li>No semantic layers shared by at least two selected cities.</li>
              ) : (
                comparison.sharedLayers.map((layer) => (
                  <li key={layer.layer}>
                    <strong>{layer.layer}</strong> in {layer.cityCount}/{selectedCities.length} cities ·{' '}
                    {layer.perCity
                      .filter((entry) => entry.colorCount > 0)
                      .map((entry) => `${entry.cityName} (${entry.prominent ? 'prominent' : 'present'})`)
                      .join(', ')}
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="panel" aria-labelledby="profile-heading">
            <h2 id="profile-heading">6) Confidence / status profile</h2>
            <ul className="insight-list">
              {comparison.confidenceProfile.map((entry) => (
                <li key={`${entry.citySlug}-status`}>
                  <strong>{entry.cityName}</strong>: {entry.status} (avg confidence {(entry.averageConfidence * 100).toFixed(0)}%) — {entry.caveat}
                </li>
              ))}
            </ul>
          </section>

          <section className="panel" aria-labelledby="export-heading">
            <h2 id="export-heading">7) Combined export</h2>
            <p>Export the current comparison as JSON, Markdown, or CSS custom properties.</p>
            <div className="export-actions">
              <button type="button" onClick={exportJson}>Export JSON</button>
              <button type="button" onClick={exportMarkdown}>Export Markdown</button>
              <button type="button" onClick={exportCss}>Export CSS Variables</button>
            </div>
          </section>
        </>
      ) : (
        <section className="panel" aria-labelledby="empty-state-heading">
          <h2 id="empty-state-heading">Comparison empty state</h2>
          <p>Select at least two cities to generate a comparison result.</p>
        </section>
      )}
    </main>
  );
}
