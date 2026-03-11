import { useMemo, useState } from 'react';
import { getAllCities } from '../lib/dataLoader';
import type { City, PaletteColor } from '../types/chromapolis';

interface ColorMatch {
  citySlug: string;
  cityName: string;
  hex: string;
  name: string;
  layer: string;
}

interface SimilarHueGroup {
  cityA: string;
  cityB: string;
  hueDistance: number;
  colorA: ColorMatch;
  colorB: ColorMatch;
}

interface ContrastHueGroup {
  cityA: string;
  cityB: string;
  hueDistance: number;
  colorA: ColorMatch;
  colorB: ColorMatch;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHue(r: number, g: number, b: number): number {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  if (delta === 0) {
    return 0;
  }

  let hue = 0;
  if (max === rn) {
    hue = ((gn - bn) / delta) % 6;
  } else if (max === gn) {
    hue = (bn - rn) / delta + 2;
  } else {
    hue = (rn - gn) / delta + 4;
  }

  return Math.round((hue * 60 + 360) % 360);
}

function hueDistance(a: number, b: number): number {
  const distance = Math.abs(a - b);
  return Math.min(distance, 360 - distance);
}

function getHue(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHue(r, g, b);
}

function toMatch(city: City, color: PaletteColor): ColorMatch {
  return {
    citySlug: city.slug,
    cityName: city.name,
    hex: color.hex,
    name: color.name,
    layer: color.layer,
  };
}

function selectedCitiesFromSlugs(slugs: string[], allCities: City[]): City[] {
  return slugs
    .map((slug) => allCities.find((city) => city.slug === slug))
    .filter((city): city is City => city !== undefined);
}

export function ComparePage() {
  const allCities = useMemo(() => getAllCities().sort((a, b) => a.name.localeCompare(b.name)), []);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(allCities.slice(0, 2).map((city) => city.slug));

  const selectedCities = useMemo(
    () => selectedCitiesFromSlugs(selectedSlugs, allCities),
    [allCities, selectedSlugs],
  );

  const similarHueGroups = useMemo(() => {
    const groups: SimilarHueGroup[] = [];

    for (let cityIndex = 0; cityIndex < selectedCities.length; cityIndex += 1) {
      for (let nextCityIndex = cityIndex + 1; nextCityIndex < selectedCities.length; nextCityIndex += 1) {
        const cityA = selectedCities[cityIndex];
        const cityB = selectedCities[nextCityIndex];

        cityA.palette.forEach((colorA) => {
          cityB.palette.forEach((colorB) => {
            const distance = hueDistance(getHue(colorA.hex), getHue(colorB.hex));
            if (distance <= 20) {
              groups.push({
                cityA: cityA.slug,
                cityB: cityB.slug,
                hueDistance: distance,
                colorA: toMatch(cityA, colorA),
                colorB: toMatch(cityB, colorB),
              });
            }
          });
        });
      }
    }

    return groups.sort((a, b) => a.hueDistance - b.hueDistance).slice(0, 8);
  }, [selectedCities]);

  const contrastHueGroups = useMemo(() => {
    const groups: ContrastHueGroup[] = [];

    for (let cityIndex = 0; cityIndex < selectedCities.length; cityIndex += 1) {
      for (let nextCityIndex = cityIndex + 1; nextCityIndex < selectedCities.length; nextCityIndex += 1) {
        const cityA = selectedCities[cityIndex];
        const cityB = selectedCities[nextCityIndex];

        cityA.palette.forEach((colorA) => {
          cityB.palette.forEach((colorB) => {
            const distance = hueDistance(getHue(colorA.hex), getHue(colorB.hex));
            if (distance >= 140) {
              groups.push({
                cityA: cityA.slug,
                cityB: cityB.slug,
                hueDistance: distance,
                colorA: toMatch(cityA, colorA),
                colorB: toMatch(cityB, colorB),
              });
            }
          });
        });
      }
    }

    return groups.sort((a, b) => b.hueDistance - a.hueDistance).slice(0, 8);
  }, [selectedCities]);

  const sharedCulturalLayers = useMemo(() => {
    const culturalByCity = selectedCities.map((city) => ({
      citySlug: city.slug,
      cityName: city.name,
      colors: city.palette
        .filter((color) => color.layer === 'cultural')
        .map((color) => ({
          hex: color.hex,
          name: color.name,
        })),
    }));

    return culturalByCity.filter((item) => item.colors.length > 0);
  }, [selectedCities]);

  function toggleCity(slug: string) {
    const isSelected = selectedSlugs.includes(slug);

    if (isSelected) {
      if (selectedSlugs.length <= 2) {
        return;
      }

      setSelectedSlugs(selectedSlugs.filter((value) => value !== slug));
      return;
    }

    if (selectedSlugs.length >= 4) {
      return;
    }

    setSelectedSlugs([...selectedSlugs, slug]);
  }

  function exportCombinedPalette() {
    const payload = {
      generatedAt: new Date().toISOString(),
      citySlugs: selectedCities.map((city) => city.slug),
      cities: selectedCities.map((city) => ({
        slug: city.slug,
        name: city.name,
        country: city.country,
        palette: city.palette,
      })),
      highlights: {
        similarHues: similarHueGroups,
        contrastingHues: contrastHueGroups,
        sharedCulturalLayers,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chromapolis-compare-${selectedCities.map((city) => city.slug).join('-')}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="layout">
      <header className="hero">
        <p className="kicker">Compare Cities</p>
        <h1>Compare up to four city palettes</h1>
        <p>Choose between 2 and 4 cities to inspect side-by-side palette swatches, hue relationships, and shared cultural color layers.</p>
      </header>

      <section className="panel" aria-labelledby="compare-select-heading">
        <h2 id="compare-select-heading">1) Select 2–4 cities</h2>
        <div className="city-options" role="group" aria-label="City selection">
          {allCities.map((city) => {
            const checked = selectedSlugs.includes(city.slug);
            const disabled = (!checked && selectedSlugs.length >= 4) || (checked && selectedSlugs.length <= 2);

            return (
              <label className="city-option" key={city.slug}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleCity(city.slug)}
                />
                <span>{city.name}, {city.countryCode}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="panel" aria-labelledby="side-by-side-heading">
        <h2 id="side-by-side-heading">2) Side-by-side palettes</h2>
        <div className="compare-grid">
          {selectedCities.map((city) => (
            <article className="compare-city-card" key={city.slug}>
              <h3>{city.name}</h3>
              <p>{city.country}</p>
              <ul className="swatches" aria-label={`${city.name} palette`}>
                {city.palette.map((color) => {
                  const isCultural = color.layer === 'cultural';
                  const inSimilar = similarHueGroups.some(
                    (group) =>
                      (group.colorA.citySlug === city.slug && group.colorA.hex === color.hex) ||
                      (group.colorB.citySlug === city.slug && group.colorB.hex === color.hex),
                  );
                  const inContrast = contrastHueGroups.some(
                    (group) =>
                      (group.colorA.citySlug === city.slug && group.colorA.hex === color.hex) ||
                      (group.colorB.citySlug === city.slug && group.colorB.hex === color.hex),
                  );

                  return (
                    <li key={`${city.slug}-${color.hex}`}>
                      <span className="swatch" style={{ background: color.hex }} aria-hidden="true" />
                      <div>
                        <code>{color.hex}</code>
                        <div className="swatch-meta">
                          <span>{color.name}</span>
                          {inSimilar ? <span className="tag similar">Similar hue</span> : null}
                          {inContrast ? <span className="tag contrast">Contrast hue</span> : null}
                          {isCultural ? <span className="tag cultural">Cultural layer</span> : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="grid compare-insights">
        <section className="panel" aria-labelledby="similar-heading">
          <h2 id="similar-heading">3) Similar hues</h2>
          <ul className="insight-list">
            {similarHueGroups.length === 0 ? <li>No close hue matches found.</li> : similarHueGroups.map((group, index) => (
              <li key={`${group.cityA}-${group.cityB}-similar-${index}`}>
                {group.colorA.cityName} {group.colorA.hex} ↔ {group.colorB.cityName} {group.colorB.hex} (Δh {group.hueDistance}°)
              </li>
            ))}
          </ul>
        </section>

        <section className="panel" aria-labelledby="contrast-heading">
          <h2 id="contrast-heading">4) Contrasting hues</h2>
          <ul className="insight-list">
            {contrastHueGroups.length === 0 ? <li>No high-contrast hue pairs found.</li> : contrastHueGroups.map((group, index) => (
              <li key={`${group.cityA}-${group.cityB}-contrast-${index}`}>
                {group.colorA.cityName} {group.colorA.hex} ↔ {group.colorB.cityName} {group.colorB.hex} (Δh {group.hueDistance}°)
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section className="panel" aria-labelledby="cultural-heading">
        <h2 id="cultural-heading">5) Shared cultural color layers</h2>
        <ul className="insight-list">
          {sharedCulturalLayers.length < 2 ? <li>Need at least two cities with cultural-layer colors to compare.</li> : sharedCulturalLayers.map((entry) => (
            <li key={`${entry.citySlug}-cultural`}>
              <strong>{entry.cityName}:</strong> {entry.colors.map((color) => `${color.name} (${color.hex})`).join(', ')}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel" aria-labelledby="export-heading">
        <h2 id="export-heading">6) Combined export</h2>
        <p>Download a JSON bundle of selected city palettes plus computed highlights.</p>
        <button type="button" onClick={exportCombinedPalette}>Export comparison JSON</button>
      </section>
    </main>
  );
}
