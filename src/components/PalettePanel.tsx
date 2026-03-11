const placeholderSwatches = ['#D9CBB6', '#9CAFB7', '#4D5A71', '#E3A75F', '#B34F3F'];

export function PalettePanel() {
  return (
    <section className="panel" aria-labelledby="palette-heading">
      <h2 id="palette-heading">Palette</h2>
      <p>
        Placeholder panel for selected city palettes. Colors below are illustrative
        only.
      </p>
      <ul className="swatches" aria-label="Example palette swatches">
        {placeholderSwatches.map((hex) => (
          <li key={hex}>
            <span className="swatch" style={{ background: hex }} aria-hidden="true" />
            <code>{hex}</code>
          </li>
        ))}
      </ul>
      {/* Future integration: render palette metadata from /data JSON or Markdown records. */}
    </section>
  );
}
