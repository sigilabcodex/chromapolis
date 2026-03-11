# Chromapolis Data Model (MVP v0.1)

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
- `palette` (non-empty)
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
