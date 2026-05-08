# Chromapolis Data Model (v0.4 notes)

This document defines a transparent, human-editable model for city palette records.
It is designed for local-first and static-first workflows.

## Goals

- Keep city records auditable as plain JSON.
- Separate **factual** inputs from **interpretive/editorial** inputs.
- Keep validation simple enough for contributors to understand quickly.

## Core model

The TypeScript source of truth lives in `src/types/chromapolis.ts`.

### Factual layer examples

- `name`, `country`, `countryCode`, `region`
- `coordinates`, `population`
- source-backed palette entries with `layer` values such as `official`, `historical`, `natural`, `architectural`, `cultural`

### Interpretive layer examples

- `layer: "editorial"` palette entries
- `rationale`, `confidence`, and `prominence`
- `notes` and `editorialSummary`

This approach keeps interpretation explicit rather than hidden.

## File format in `/data/cities/`

Each city is one JSON file:

- Filename convention: `<city-slug>-<countryCode-lowercase>.json`
- Example: `lisbon-pt.json`

Required top-level fields:

- `slug`
- `name`
- `country`
- `countryCode` (ISO alpha-2 uppercase)
- `coordinates` (`lat`, `lon`)
- `palette` (non-empty; schema minimum is 1 color with no fixed maximum)
- `sources` (non-empty)
- `editorialSummary`

Optional top-level fields:

- `region`
- `population`
- `notes`

## Validation

- JSON Schema: `data/cities/city.schema.json`
- Lightweight TypeScript runtime helper: `src/lib/cityValidation.ts`

The schema provides language-agnostic checks.
The TS helper is intentionally minimal for editorial workflows.

## Methodology for creating a city record

1. Start from public, auditable sources.
2. Add source metadata in `sources` with short notes.
3. Add palette colors and tag each with a `layer`.
4. Write a concise `rationale` per color.
5. Score `confidence` from `0` to `1`.
6. Set `prominence` from `0` to `1` based on how visible/common the color is.
7. Write `editorialSummary` that explains how factual and interpretive layers are combined.

## Editorial guidance

- Prefer clear, plain language over marketing language.
- Keep claims traceable to sources where possible.
- Use `editorial` layer only when interpretation is intentional.
- Revisit confidence scores as new sources are added.


## Palette size and completeness guidance

The JSON Schema and TypeScript model represent `palette` as a non-empty array, so records can contain 1 color upward. ChromaPolis does not enforce an artificial fixed maximum in the schema because future datasets may need richer research palettes or generated derivatives.

For manually curated public records, the recommended editorial range is **1–9 colors**. That range keeps records readable, supports compact city identities, and still allows richer visual systems without overwhelming the current UI.

Recommended completeness labels:

- **Minimal: 1–3 colors** — a cautious starter record or single-dominant identity cue.
- **Standard: 4–6 colors** — enough range for a primary identity plus material, natural, cultural, or accent layers.
- **Complete: 7–9 colors** — a mature record with multiple layers and practical design-system depth.

Not every city must have 9 colors. A complete record should earn its depth with multiple well-rationalized layers rather than filler colors.


## Curated expansion batches

City records are added in focused editorial batches so the atlas can grow while remaining reviewable. Early batch records should be treated as starter palettes: they are useful design references backed by public sources, but their editorial colors may be refined as stronger local documentation, official identity guidance, or image-based research becomes available.

See `docs/city-record-template.md` for a contributor-facing template and review checklist.
