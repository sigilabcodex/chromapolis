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
