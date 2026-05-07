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


## Responsible city records

Use `docs/city-record-template.md` when creating or reviewing a record. In short:

- Mark colors as `official: true` only when an authoritative source supports that status.
- Keep architecture, landscape, food, craft, atmosphere, and design bridge colors editorial.
- Use concise rationales, confidence scores, prominence scores, and source notes to make uncertainty visible.
- Aim for Minimal, Standard, or Complete palette depth based on available evidence rather than forcing every city to 9 colors.
