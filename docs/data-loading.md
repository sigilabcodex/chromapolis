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
  - Builds a compile-time registry of all JSON city files under `data/cities`.
  - Loads only records listed in the manifest.
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
- `isCityDatasetHealthy()`
  - Unit-like health signal for checks/tests.
  - Returns `true` only when no load errors were recorded and at least one city was loaded.

## Validation and Graceful Failure

The loader handles data issues without crashing the app:

- **Missing fields / malformed city records**
  - The record is skipped.
  - Validation errors are added to diagnostics.
- **Manifest entry points to a missing file**
  - Entry is skipped and logged.
- **Manifest and file metadata mismatch**
  - Entry is skipped if `slug` or `countryCode` disagree.
- **Malformed or empty manifest**
  - The dataset resolves to an empty list.
  - APIs still return safe defaults (`[]` / `null`).
- **Empty dataset after validation**
  - APIs still return safe defaults (`[]` / `null`).
  - Health checks report unhealthy via `isCityDatasetHealthy()`.

Warnings are emitted with a `[dataLoader]` prefix to make issues easy to find during development.

## Lightweight Validation Approach

Validation remains intentionally lightweight:

- TypeScript types define the expected city shape.
- `validateCityRecord` enforces core runtime constraints.
- `getDataLoadDiagnostics()` and `isCityDatasetHealthy()` provide unit-like signals that can be asserted in tests later without introducing a heavy validation framework.
