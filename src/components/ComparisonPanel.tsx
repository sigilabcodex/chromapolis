import { useMemo, useState } from 'react';
import type { City, PaletteLayer } from '../types/chromapolis';

interface ComparisonPanelProps {
  cities: City[];
}

interface CityComparisonSummary {
  officialCount: number;
  editorialCount: number;
  totalColors: number;
  layers: PaletteLayer[];
}

function getCitySummary(city: City): CityComparisonSummary {
  const layers = Array.from(new Set(city.palette.map((color) => color.layer))).sort();

  return {
    officialCount: city.palette.filter((color) => color.official).length,
    editorialCount: city.palette.filter((color) => !color.official).length,
    totalColors: city.palette.length,
    layers,
  };
}

function buildSharedLayerNote(firstCity: City, secondCity: City) {
  const firstLayers = new Set(firstCity.palette.map((color) => color.layer));
  const sharedLayers = Array.from(
    new Set(secondCity.palette.map((color) => color.layer).filter((layer) => firstLayers.has(layer))),
  ).sort();

  if (sharedLayers.length === 0) {
    return 'No shared layer types yet; this pairing highlights different palette evidence layers.';
  }

  return sharedLayers.join(', ');
}

function buildCombinedHexList(firstCity: City, secondCity: City) {
  return [firstCity, secondCity]
    .flatMap((city) => city.palette.map((color) => `${color.hex} /* ${city.name} — ${color.name} */`))
    .join('\n');
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildCombinedCssVariables(firstCity: City, secondCity: City) {
  const body = [firstCity, secondCity]
    .flatMap((city) =>
      city.palette.map((color, index) => {
        const colorSlug = slugify(color.name);
        return `  --chromapolis-${city.slug}-${index + 1}-${colorSlug}: ${color.hex};`;
      }),
    )
    .join('\n');

  return `:root {\n${body}\n}`;
}

function buildCombinedJson(firstCity: City, secondCity: City, sharedLayerNote: string) {
  return JSON.stringify(
    {
      comparison: {
        generatedBy: 'ChromaPolis Palette Comparison',
        cities: [firstCity.slug, secondCity.slug],
        sharedLayers: sharedLayerNote,
      },
      palettes: [firstCity, secondCity].map((city) => ({
        city: city.name,
        country: city.country,
        slug: city.slug,
        colors: city.palette,
      })),
    },
    null,
    2,
  );
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function CityComparisonCard({ city }: { city: City }) {
  return (
    <article className="compare-card" aria-labelledby={`${city.slug}-compare-heading`}>
      <header>
        <h3 id={`${city.slug}-compare-heading`}>{city.name}</h3>
        <p>{city.country}</p>
      </header>
      <ul className="compare-palette" aria-label={`${city.name} comparison palette`}>
        {city.palette.map((color) => (
          <li key={`${city.slug}-${color.hex}-${color.name}`} className="compare-color-row">
            <span className="swatch" style={{ background: color.hex }} aria-hidden="true" />
            <div>
              <div className="color-row">
                <strong>{color.name}</strong>
                <code>{color.hex}</code>
              </div>
              <p className="layer-label">{color.layer}</p>
              <p className="confidence">
                Confidence {Math.round(color.confidence * 100)}% · Prominence{' '}
                {Math.round(color.prominence * 100)}%{color.official ? ' · Official' : ' · Editorial'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function ComparisonPanel({ cities }: ComparisonPanelProps) {
  const sortedCities = useMemo(
    () =>
      [...cities].sort((a, b) =>
        `${a.name}, ${a.country}`.localeCompare(`${b.name}, ${b.country}`),
      ),
    [cities],
  );
  const [firstCitySlug, setFirstCitySlug] = useState(sortedCities[0]?.slug ?? '');
  const [secondCitySlug, setSecondCitySlug] = useState(sortedCities[1]?.slug ?? sortedCities[0]?.slug ?? '');
  const [status, setStatus] = useState('');

  const firstCity = sortedCities.find((city) => city.slug === firstCitySlug) ?? sortedCities[0] ?? null;
  const secondCity = sortedCities.find((city) => city.slug === secondCitySlug) ?? sortedCities[1] ?? sortedCities[0] ?? null;

  const firstSummary = useMemo(() => (firstCity ? getCitySummary(firstCity) : null), [firstCity]);
  const secondSummary = useMemo(() => (secondCity ? getCitySummary(secondCity) : null), [secondCity]);
  const sharedLayerNote = useMemo(
    () => (firstCity && secondCity ? buildSharedLayerNote(firstCity, secondCity) : 'Select two cities to compare layers.'),
    [firstCity, secondCity],
  );
  const combinedHexList = useMemo(
    () => (firstCity && secondCity ? buildCombinedHexList(firstCity, secondCity) : ''),
    [firstCity, secondCity],
  );
  const combinedCssVariables = useMemo(
    () => (firstCity && secondCity ? buildCombinedCssVariables(firstCity, secondCity) : ''),
    [firstCity, secondCity],
  );
  const combinedJson = useMemo(
    () => (firstCity && secondCity ? buildCombinedJson(firstCity, secondCity, sharedLayerNote) : ''),
    [firstCity, secondCity, sharedLayerNote],
  );

  async function copyText(text: string, message: string) {
    if (!navigator.clipboard) {
      setStatus('Clipboard not available in this environment.');
      return;
    }

    await navigator.clipboard.writeText(text);
    setStatus(message);
  }

  function downloadCombinedJson() {
    if (!firstCity || !secondCity) return;
    downloadFile(`${firstCity.slug}-${secondCity.slug}-comparison.json`, combinedJson, 'application/json');
    setStatus('Combined JSON downloaded.');
  }

  if (sortedCities.length === 0) {
    return (
      <section className="panel compare-panel" aria-labelledby="compare-heading">
        <h2 id="compare-heading">Palette Comparison</h2>
        <p>No valid city records are available to compare.</p>
      </section>
    );
  }

  return (
    <section className="panel compare-panel" aria-labelledby="compare-heading">
      <header className="compare-header">
        <div>
          <h2 id="compare-heading">Palette Comparison</h2>
          <p>Preview two static city palettes side by side for quick designer handoff.</p>
        </div>
        <div className="palette-actions">
          <button type="button" onClick={() => copyText(combinedHexList, 'Combined HEX list copied.')}>
            copy combined HEX
          </button>
          <button type="button" onClick={() => copyText(combinedCssVariables, 'Combined CSS variables copied.')}>
            copy combined CSS variables
          </button>
          <button type="button" onClick={downloadCombinedJson}>
            download combined JSON
          </button>
        </div>
      </header>

      <div className="compare-selectors" aria-label="Choose cities to compare">
        <label htmlFor="compare-first-city">
          First city
          <select
            id="compare-first-city"
            value={firstCity?.slug ?? ''}
            onChange={(event) => setFirstCitySlug(event.target.value)}
          >
            {sortedCities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}, {city.countryCode} — {city.country}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="compare-second-city">
          Second city
          <select
            id="compare-second-city"
            value={secondCity?.slug ?? ''}
            onChange={(event) => setSecondCitySlug(event.target.value)}
          >
            {sortedCities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}, {city.countryCode} — {city.country}
              </option>
            ))}
          </select>
        </label>
      </div>

      {firstCity && secondCity && firstSummary && secondSummary ? (
        <>
          <div className="comparison-notes" aria-label="Comparison notes">
            <div>
              <span>Shared layer types</span>
              <strong>{sharedLayerNote}</strong>
            </div>
            <div>
              <span>Official vs editorial</span>
              <strong>
                {firstCity.name}: {firstSummary.officialCount}/{firstSummary.editorialCount} · {secondCity.name}:{' '}
                {secondSummary.officialCount}/{secondSummary.editorialCount}
              </strong>
            </div>
            <div>
              <span>Total colors</span>
              <strong>
                {firstCity.name}: {firstSummary.totalColors} · {secondCity.name}: {secondSummary.totalColors}
              </strong>
            </div>
            <div>
              <span>Layer coverage</span>
              <strong>
                {firstCity.name}: {firstSummary.layers.join(', ')} · {secondCity.name}:{' '}
                {secondSummary.layers.join(', ')}
              </strong>
            </div>
          </div>

          <div className="comparison-grid">
            <CityComparisonCard city={firstCity} />
            <CityComparisonCard city={secondCity} />
          </div>
        </>
      ) : null}

      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
