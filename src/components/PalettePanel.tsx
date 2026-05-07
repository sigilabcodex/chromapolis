import { useMemo, useState } from 'react';
import type { City, PaletteColor } from '../types/chromapolis';
import { getPaletteCompleteness } from '../lib/paletteCompleteness';

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildCssVariables(city: City) {
  const body = city.palette
    .map((color, index) => {
      const slug = slugify(color.name);
      return `  --chromapolis-${city.slug}-${index + 1}-${slug}: ${color.hex};`;
    })
    .join('\n');

  return `:root {\n${body}\n}`;
}

function buildGpl(city: City) {
  const rows = city.palette
    .map((color) => {
      const [r, g, b] = color.hex
        .slice(1)
        .match(/.{1,2}/g)
        ?.map((part) => Number.parseInt(part, 16)) ?? [0, 0, 0];

      return `${r.toString().padStart(3, ' ')} ${g.toString().padStart(3, ' ')} ${b
        .toString()
        .padStart(3, ' ')} ${color.name}`;
    })
    .join('\n');

  return `GIMP Palette\nName: ${city.name} - ChromaPolis\nColumns: ${Math.min(city.palette.length, 5)}\n#\n${rows}\n`;
}

function buildPaletteJson(city: City) {
  return JSON.stringify(
    {
      city: city.name,
      country: city.country,
      slug: city.slug,
      editorialSummary: city.editorialSummary,
      colors: city.palette,
      sources: city.sources,
    },
    null,
    2,
  );
}

function buildAsePlaceholder(city: City) {
  return [
    'ASE_TEXT_PLACEHOLDER',
    `City: ${city.name}`,
    `Country: ${city.country}`,
    ...city.palette.map((color) => `${color.name}=${color.hex}`),
    'Note: This is a plain-text placeholder, not a binary Adobe Swatch Exchange (.ase) file yet.',
  ].join('\n');
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

interface PalettePanelProps {
  city: City | null;
}

export function PalettePanel({ city }: PalettePanelProps) {
  const [status, setStatus] = useState('');

  const paletteJson = useMemo(() => (city ? buildPaletteJson(city) : ''), [city]);
  const paletteCss = useMemo(() => (city ? buildCssVariables(city) : ''), [city]);
  const paletteGpl = useMemo(() => (city ? buildGpl(city) : ''), [city]);
  const paletteAsePlaceholder = useMemo(() => (city ? buildAsePlaceholder(city) : ''), [city]);
  const paletteCompleteness = city ? getPaletteCompleteness(city.palette.length) : '';
  const paletteLayerSummary = useMemo(() => {
    if (!city) return '';

    return Array.from(new Set(city.palette.map((color) => color.layer))).join(', ');
  }, [city]);

  async function copyText(text: string, message: string) {
    if (!navigator.clipboard) {
      setStatus('Clipboard not available in this environment.');
      return;
    }

    await navigator.clipboard.writeText(text);
    setStatus(message);
  }

  if (!city) {
    return (
      <section className="panel palette-panel" aria-labelledby="palette-heading">
        <header className="palette-header">
          <div>
            <h2 id="palette-heading">Palette Viewer</h2>
            <p>No valid city record selected.</p>
          </div>
        </header>
        <p className="status">Add or fix city records in the dataset to view palettes.</p>
      </section>
    );
  }

  function exportFile(extension: string, content: string, mimeType: string) {
    if (!city) return;
    downloadFile(`${city.slug}-palette.${extension}`, content, mimeType);
  }

  function copyHex(color: PaletteColor) {
    return copyText(color.hex, `${color.hex} copied.`);
  }

  return (
    <section className="panel palette-panel" aria-labelledby="palette-heading">
      <header className="palette-header">
        <div>
          <h2 id="palette-heading">Palette Viewer</h2>
          <p>
            {city.name}, {city.country} · selected palette contains {city.palette.length}{' '}
            color{city.palette.length === 1 ? '' : 's'} · {paletteCompleteness}
          </p>
          <p className="palette-size-note">Recommended editorial range: 1–9 colors.</p>
        </div>
        <div className="palette-actions">
          <button type="button" onClick={() => copyText(paletteJson, 'Palette JSON copied.')}>
            copy palette as JSON
          </button>
          <button type="button" onClick={() => copyText(paletteCss, 'Palette CSS variables copied.')}>
            copy palette as CSS variables
          </button>
        </div>
      </header>

      <div className="palette-overview" aria-label={`${city.name} palette overview`}>
        <div className="palette-overview-bar" role="group" aria-label={`${city.name} palette colors`}>
          {city.palette.map((color) => (
            <button
              key={`${city.slug}-overview-${color.hex}-${color.name}`}
              type="button"
              className="palette-overview-segment"
              style={{ background: color.hex }}
              onClick={() => copyHex(color)}
              aria-label={`Copy ${color.name} ${color.hex}`}
              title={`${color.name} · ${color.hex} · ${color.layer}`}
            />
          ))}
        </div>
        <p className="palette-overview-meta">
          {city.palette.length} color{city.palette.length === 1 ? '' : 's'} ·{' '}
          <span className="completeness-label">{paletteCompleteness}</span>
          {paletteLayerSummary ? ` · ${paletteLayerSummary}` : ''}
        </p>
      </div>

      <ul className="palette-grid" aria-label={`${city.name} color palette`}>
        {city.palette.map((color) => (
          <li key={`${city.slug}-${color.hex}-${color.name}`} className="color-card">
            <span className="swatch swatch-lg" style={{ background: color.hex }} aria-hidden="true" />
            <div className="color-meta">
              <div className="color-row">
                <strong>{color.name}</strong>
                <code>{color.hex}</code>
              </div>
              <p className="layer-label">{color.layer}</p>
              <p className="rationale">{color.rationale}</p>
              <p className="confidence">
                Confidence {Math.round(color.confidence * 100)}% · Prominence{' '}
                {Math.round(color.prominence * 100)}%{color.official ? ' · Official' : ''}
              </p>
            </div>
            <div className="preview-pair" aria-label="Light and dark color preview helpers">
              <div className="preview-chip preview-light" style={{ color: color.hex }}>
                Aa
              </div>
              <div className="preview-chip preview-dark" style={{ color: color.hex }}>
                Aa
              </div>
            </div>
            <button type="button" className="copy-hex" onClick={() => copyHex(color)}>
              copy HEX
            </button>
          </li>
        ))}
      </ul>

      <div className="export-row">
        <span>Export:</span>
        <button type="button" onClick={() => exportFile('json', paletteJson, 'application/json')}>
          JSON
        </button>
        <button type="button" onClick={() => exportFile('css', paletteCss, 'text/css')}>
          CSS
        </button>
        <button
          type="button"
          onClick={() => exportFile('ase.txt', paletteAsePlaceholder, 'text/plain')}
          title="Downloads a plain-text placeholder, not a binary Adobe Swatch Exchange file yet"
        >
          ASE placeholder (.txt)
        </button>
        <button type="button" onClick={() => exportFile('gpl', paletteGpl, 'text/plain')}>
          GPL
        </button>
      </div>
      {status ? <p className="status">{status}</p> : null}
    </section>
  );
}
