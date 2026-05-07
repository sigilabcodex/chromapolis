import type { City } from '../types/chromapolis';
import { getPaletteCompleteness } from '../lib/paletteCompleteness';

interface VisualAtlasProps {
  cities: City[];
  selectedCity: City | null;
  onSelectCity: (slug: string) => void;
}

function projectCoordinates(lat: number, lon: number) {
  return {
    x: ((lon + 180) / 360) * 100,
    y: ((90 - lat) / 180) * 100,
  };
}

function formatCoordinate(value: number, positiveSuffix: string, negativeSuffix: string) {
  const suffix = value >= 0 ? positiveSuffix : negativeSuffix;
  return `${Math.abs(value).toFixed(2)}°${suffix}`;
}

function getMarkerSize(colorCount: number) {
  return Math.min(2.5, 1.1 + colorCount * 0.16);
}

export function VisualAtlas({ cities, selectedCity, onSelectCity }: VisualAtlasProps) {
  if (cities.length === 0) {
    return <p className="atlas-empty">No valid city coordinates are available for the atlas yet.</p>;
  }

  return (
    <div className="visual-atlas" aria-label="Static world-plane visual atlas of city palettes">
      <div className="atlas-plane" role="img" aria-label="Equirectangular city palette marker plane">
        <svg className="atlas-graticule" viewBox="0 0 100 50" aria-hidden="true" focusable="false">
          <rect x="0" y="0" width="100" height="50" rx="2" />
          {[25, 50, 75].map((x) => (
            <line key={`lon-${x}`} x1={x} x2={x} y1="0" y2="50" />
          ))}
          {[12.5, 25, 37.5].map((y) => (
            <line key={`lat-${y}`} x1="0" x2="100" y1={y} y2={y} />
          ))}
          <path d="M8 17 C15 12 26 12 33 17 C39 22 48 19 54 15 C63 10 73 12 82 17 C88 20 93 22 97 21" />
          <path d="M6 34 C15 31 24 33 31 36 C40 40 51 38 59 34 C68 30 77 31 88 35 C92 37 96 38 99 37" />
        </svg>

        {cities.map((city) => {
          const position = projectCoordinates(city.coordinates.lat, city.coordinates.lon);
          const isSelected = city.slug === selectedCity?.slug;
          const markerSize = getMarkerSize(city.palette.length);

          return (
            <button
              key={city.slug}
              type="button"
              className={isSelected ? 'atlas-marker atlas-marker-selected' : 'atlas-marker'}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${markerSize}rem`,
                height: `${markerSize}rem`,
              }}
              onClick={() => onSelectCity(city.slug)}
              aria-pressed={isSelected}
              aria-label={`Select ${city.name}, ${city.country}; ${city.palette.length} color palette at ${formatCoordinate(
                city.coordinates.lat,
                'N',
                'S',
              )}, ${formatCoordinate(city.coordinates.lon, 'E', 'W')}`}
            >
              <span className="atlas-marker-palette" aria-hidden="true">
                {city.palette.slice(0, 9).map((color) => (
                  <span key={`${city.slug}-${color.name}-${color.hex}`} style={{ background: color.hex }} />
                ))}
              </span>
              <span className="atlas-marker-label">{city.name}</span>
            </button>
          );
        })}
      </div>

      <ul className="atlas-city-list" aria-label="City atlas marker list">
        {cities.map((city) => (
          <li key={city.slug}>
            <button
              type="button"
              className={city.slug === selectedCity?.slug ? 'atlas-list-button active' : 'atlas-list-button'}
              onClick={() => onSelectCity(city.slug)}
            >
              <span className="mini-palette" aria-hidden="true">
                {city.palette.slice(0, 9).map((color) => (
                  <span key={`${city.slug}-mini-${color.name}-${color.hex}`} style={{ background: color.hex }} />
                ))}
              </span>
              <span>
                <strong>{city.name}</strong>
                <small>
                  {city.countryCode} · {city.palette.length} color{city.palette.length === 1 ? '' : 's'} ·{' '}
                  <span className="completeness-label">{getPaletteCompleteness(city.palette.length)}</span>
                </small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
