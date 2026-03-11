import { useMemo, useState } from 'react';

interface PaletteColor {
  hex: string;
  name: string;
  layer: string;
  rationale: string;
}

const cityPalette = {
  city: 'Lisbon',
  label: 'Azulejo Morning',
  colors: [
    {
      hex: '#D9CBB6',
      name: 'Limestone Facade',
      layer: 'Base Surface',
      rationale:
        'Warm limestone tones from Baixa building fronts establish a quiet architectural base.'
    },
    {
      hex: '#9CAFB7',
      name: 'Tagus Mist',
      layer: 'Atmosphere',
      rationale:
        'Muted blue-grey mirrors coastal haze that softens contrast through the afternoon.'
    },
    {
      hex: '#4D5A71',
      name: 'Shadow Tram',
      layer: 'Structure',
      rationale:
        'Deep steel-blue references tram hardware and cast-iron street details for visual anchors.'
    },
    {
      hex: '#E3A75F',
      name: 'Terracotta Sun',
      layer: 'Highlight',
      rationale:
        'A sunlit ochre accent inspired by tiled roofs and reflected evening light.'
    },
    {
      hex: '#B34F3F',
      name: 'Market Clay',
      layer: 'Accent',
      rationale:
        'Earthy red adds lively contrast, echoing ceramic stalls and weathered painted doors.'
    }
  ] as PaletteColor[]
};

function buildCssVariables(colors: PaletteColor[]) {
  const body = colors
    .map((color, index) => {
      const slug = color.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return `  --city-${index + 1}-${slug}: ${color.hex};`;
    })
    .join('\n');

  return `:root {\n${body}\n}`;
}

function buildGpl(colors: PaletteColor[]) {
  const rows = colors
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

  return `GIMP Palette\nName: ${cityPalette.city} - ${cityPalette.label}\nColumns: 5\n#\n${rows}\n`;
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

export function PalettePanel() {
  const [status, setStatus] = useState('');

  const paletteJson = useMemo(() => JSON.stringify(cityPalette, null, 2), []);
  const paletteCss = useMemo(() => buildCssVariables(cityPalette.colors), []);
  const paletteGpl = useMemo(() => buildGpl(cityPalette.colors), []);
  const paletteAsePlaceholder = useMemo(
    () =>
      [
        'ASE_PLACEHOLDER',
        `City: ${cityPalette.city}`,
        `Palette: ${cityPalette.label}`,
        ...cityPalette.colors.map((color) => `${color.name}=${color.hex}`),
        'Note: Replace this placeholder with binary ASE generation in a future iteration.'
      ].join('\n'),
    []
  );

  async function copyText(text: string, message: string) {
    if (!navigator.clipboard) {
      setStatus('Clipboard not available in this environment.');
      return;
    }

    await navigator.clipboard.writeText(text);
    setStatus(message);
  }

  return (
    <section className="panel palette-panel" aria-labelledby="palette-heading">
      <header className="palette-header">
        <div>
          <h2 id="palette-heading">Palette Viewer</h2>
          <p>
            {cityPalette.city} · {cityPalette.label}
          </p>
        </div>
        <div className="palette-actions">
          <button type="button" onClick={() => copyText(paletteJson, 'Palette JSON copied.')}>copy palette as JSON</button>
          <button type="button" onClick={() => copyText(paletteCss, 'Palette CSS variables copied.')}>copy palette as CSS variables</button>
        </div>
      </header>

      <ul className="palette-grid" aria-label={`${cityPalette.city} color palette`}>
        {cityPalette.colors.map((color) => (
          <li key={color.hex} className="color-card">
            <span className="swatch swatch-lg" style={{ background: color.hex }} aria-hidden="true" />
            <div className="color-meta">
              <div className="color-row">
                <strong>{color.name}</strong>
                <code>{color.hex}</code>
              </div>
              <p className="layer-label">{color.layer}</p>
              <p className="rationale">{color.rationale}</p>
            </div>
            <div className="preview-pair" aria-label="Light and dark color preview helpers">
              <div className="preview-chip preview-light" style={{ color: color.hex }}>
                Aa
              </div>
              <div className="preview-chip preview-dark" style={{ color: color.hex }}>
                Aa
              </div>
            </div>
            <button type="button" className="copy-hex" onClick={() => copyText(color.hex, `${color.hex} copied.`)}>
              copy HEX
            </button>
          </li>
        ))}
      </ul>

      <div className="export-row">
        <span>Export:</span>
        <button type="button" onClick={() => downloadFile('lisbon-palette.json', paletteJson, 'application/json')}>
          JSON
        </button>
        <button type="button" onClick={() => downloadFile('lisbon-palette.css', paletteCss, 'text/css')}>
          CSS
        </button>
        <button
          type="button"
          onClick={() => downloadFile('lisbon-palette.ase.txt', paletteAsePlaceholder, 'text/plain')}
          title="Placeholder text export for future ASE binary support"
        >
          ASE
        </button>
        <button type="button" onClick={() => downloadFile('lisbon-palette.gpl', paletteGpl, 'text/plain')}>
          GPL
        </button>
      </div>

      {status ? <p className="status" role="status">{status}</p> : null}
    </section>
  );
}
