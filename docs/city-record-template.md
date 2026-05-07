# City Record Template

Use this template when adding or reviewing a ChromaPolis city record. The JSON schema remains the technical source of truth, but this checklist keeps records responsible and designer-useful.

## Palette completeness

Recommended curated palette sizes:

- **Minimal: 1–3 colors** — a cautious starter for cities with limited sourcing or a single dominant identity cue.
- **Standard: 4–6 colors** — enough depth for primary material, natural, cultural, and accent layers.
- **Complete: 7–9 colors** — a mature editorial record with multiple layers and enough range for practical design systems.

Not every city must have 9 colors. Complete records should aim for multiple layers rather than filler: official or symbolic context when defensible, plus architectural, natural, cultural, historical, and editorial accents with clear rationales.

## JSON starter

```json
{
  "slug": "city-slug",
  "name": "City Name",
  "country": "Country",
  "countryCode": "XX",
  "region": "Region or state",
  "coordinates": {
    "lat": 0,
    "lon": 0
  },
  "population": 0,
  "palette": [
    {
      "hex": "#000000",
      "name": "Color Name",
      "layer": "architectural",
      "rationale": "Concise designer-facing reason this color belongs in the palette.",
      "confidence": 0.6,
      "official": false,
      "prominence": 0.5
    }
  ],
  "sources": [
    {
      "title": "Source title",
      "url": "https://example.com/",
      "publisher": "Publisher",
      "sourceType": "government",
      "note": "What this source supports."
    }
  ],
  "notes": "Distinguish official colors from editorial interpretation and flag items needing review.",
  "editorialSummary": "One paragraph explaining how the palette layers work together."
}
```

## Field guidance

### Official vs editorial colors

- Set `official: true` only when the color is documented by a government, flag, seal, city brand, transit brand, or other authoritative identity system.
- If a color is inferred from architecture, landscape, culture, food, markets, textiles, climate, or urban atmosphere, keep `official: false`.
- National-symbol colors can be useful for capitals, but describe them as national or symbolic context rather than city-owned colors.

### Palette layers

Use the most specific layer available:

- `official` — documented civic or institutional identity.
- `symbolic` — national symbols, flags, seals, or widely used public symbols.
- `historical` — heritage, historic materials, artifacts, or documented history.
- `natural` — rivers, parks, geology, vegetation, sky, coast, or climate.
- `architectural` — stone, stucco, roofs, streets, skyline, infrastructure.
- `cultural` — craft, festivals, food, textiles, markets, ritual, local visual culture.
- `editorial` — useful design-system bridge colors or interpretive accents.

### Rationale

Keep `rationale` concise and useful for designers. Say what the color represents and avoid broad claims that a source cannot support.

### Confidence

Use `confidence` to express source strength:

- `0.8–1.0`: strong source support or documented official color.
- `0.55–0.79`: source-informed editorial interpretation.
- `0.3–0.54`: plausible starter color that needs better sourcing.

### Prominence

Use `prominence` to express practical visibility in the city's visual identity:

- High values for dominant materials, landscapes, or symbols.
- Lower values for accents, seasonal colors, or niche cultural references.

### Sources

- Prefer government, academic, museum, UNESCO, tourism-board, or community sources with stable URLs.
- Each source note should say what the source supports.
- Do not use sources to imply exact hex values unless the source actually publishes those values.

### Editorial summary

Write a short summary of the palette as a layered system. Mention uncertainty or editorial status when needed.
