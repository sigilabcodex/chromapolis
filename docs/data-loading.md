# Data Loading

Chromapolis uses a manifest-driven loader so city datasets are explicit, validated, and resilient to bad data.

## Directory Layout

- `data/cities/index.json`
  - The source of truth for which city files are loaded.
  - Each entry contains:
    - `slug`
    - `countryCode`
    - `file`
- `data/cities/<city>-<country>.json`
  - The city records.
- `src/lib/dataLoader.ts`
  - Loads records listed in the manifest.
  - Validates every record with `validateCityRecord`.
  - Exposes query helpers.

## Loader API

`src/lib/dataLoader.ts` exports:

- `getAllCities()`
  - Returns all valid cities.
- `getCityBySlug(slug)`
  - Case-insensitive lookup by slug.
  - Returns `null` when not found.
- `getCitiesByCountry(countryCode)`
  - Case-insensitive country code filter.
  - Returns an empty list when no results.
- `getDataLoadDiagnostics()`
  - Lightweight diagnostics for validation and manifest issues.

## Validation and Graceful Failure

The loader handles data issues without crashing the app:

- **Missing fields / malformed city records**
  - The record is skipped.
  - Validation errors are added to diagnostics.
- **Manifest entry points to a missing file**
  - Entry is skipped and logged.
- **Manifest and file metadata mismatch**
  - Entry is skipped if `slug` or `countryCode` disagree.
- **Empty dataset**
  - If the manifest has no entries (or all records are invalid), API calls return empty arrays / `null` as appropriate.

Warnings are emitted with a `[dataLoader]` prefix to make issues easy to find during development.

## Lightweight Validation Approach

Validation remains intentionally lightweight:

- TypeScript types define the expected city shape.
- `validateCityRecord` enforces core runtime constraints.
- `getDataLoadDiagnostics()` provides a unit-like signal that can be asserted in tests later without introducing a heavy validation framework.
