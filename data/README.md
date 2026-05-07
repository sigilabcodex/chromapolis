# Data Directory

This folder contains transparent, auditable city palette records in plain JSON.

## Structure

- `cities/index.json` — explicit manifest of city files loaded by the app.
- `cities/city.schema.json` — JSON Schema for validating city records.
- `cities/<city>-<country>.json` — one city record per file (for example `lisbon-pt.json`).

## Principles

- Human-readable and version-controlled
- No hidden/generated binary data
- Source-friendly and editorially maintainable

## Palette Size

City palettes are non-empty arrays. The schema allows palettes from 1 color
upward and does not set a hard maximum; for curated records, keep the recommended
editorial range to 1–9 colors unless there is a documented reason to go beyond
it.
