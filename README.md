# Chromapolis

**A Chromatic Atlas of Cities**

Chromapolis is a FLOSS, privacy-respecting web app for exploring city color
palettes. The current milestone is a lightweight public demo: a static Vite +
React + TypeScript application that loads auditable city records from plain JSON
and renders palette exports in the browser.

## Current Project Status

- Version: `0.1.0`, with the app moving through a focused `v0.3 Flexible
  Palettes + Visual Atlas` slice.
- App shape: static-first frontend only; no backend, login, analytics, or heavy
  map library.
- Dataset: manifest-driven city records in `data/cities/` with runtime
  validation before records are exposed to the UI.
- UI: available city records can be searched/selected locally, selected from a
  lightweight SVG/CSS visual atlas, and viewed in the palette panel.
- Exports: JSON, city-scoped CSS variables, GPL palette text, HEX copy,
  and a clearly labeled plain-text ASE placeholder are available from the
  palette panel.

## Principles

- Open source and maintainable
- Privacy by default (no tracking, no analytics, no login)
- Human-auditable dataset formats in plain text
- Accessible and readable interface
- Local-first friendly architecture
- Static hosting friendly for GitHub Pages

## Project Structure

```text
.
├── data/
│   └── cities/
│       ├── city.schema.json
│       ├── index.json
│       └── <city>-<country>.json
├── src/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   └── types/
├── index.html
├── package.json
└── vite.config.ts
```

## Local Development

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Then open the local URL printed by Vite, usually `http://localhost:5173`.

## Build

Create a production build:

```bash
npm run build
```

The build runs TypeScript project checks first (`tsc -b`) and then writes the
static site to `dist/` with Vite.

Preview the built site locally:

```bash
npm run preview
```

Because the public demo is configured for GitHub Pages under
`/chromapolis/`, the Vite base path is set to that repository path in
`vite.config.ts`.

## GitHub Pages Deployment

This repository includes a GitHub Actions workflow at
`.github/workflows/pages.yml` that:

1. checks out the repository,
2. installs dependencies with `npm ci`,
3. runs `npm run build`,
4. uploads `dist/` as a Pages artifact, and
5. deploys it to GitHub Pages.

Manual repository settings still required:

1. In GitHub, open **Settings → Pages** for `sigilabcodex/chromapolis`.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Ensure Actions are enabled for the repository.
4. Push to `main` or run the `Deploy to GitHub Pages` workflow manually.

Once deployed, the site should be served from the repository Pages URL using the
`/chromapolis/` base path.

## Data Model

- TypeScript model: `src/types/chromapolis.ts`
- JSON schema: `data/cities/city.schema.json`
- Dataset manifest: `data/cities/index.json`
- Example city record: `data/cities/lisbon-pt.json`

The app uses the manifest to load city JSON files and validates each city record
at runtime. Invalid or missing records are skipped and reported through loader
diagnostics in the UI and browser console.

## How to Add a New City Record

1. Create a new JSON file in `data/cities/` using the naming pattern
   `<city>-<country>.json`, for example `porto-pt.json`.
2. Match the structure in `data/cities/city.schema.json`:
   - stable lowercase `slug`,
   - city and country metadata,
   - coordinates,
   - one or more palette colors; the schema allows palettes from 1 color upward,
     and the recommended editorial range is 1–9 colors,
   - one or more source references,
   - an `editorialSummary`.
3. Add the file to `data/cities/index.json`:

   ```json
   {
     "slug": "porto",
     "countryCode": "PT",
     "file": "porto-pt.json"
   }
   ```

4. Run `npm run build` to confirm the manifest entry and city record pass the
   existing TypeScript/Vite build. Loader diagnostics will also report malformed
   records when the app runs.
5. Keep records human-reviewable: cite sources, distinguish official colors from
   editorial interpretation with the `official` flag, and use confidence and
   prominence values to document uncertainty.

## Visual Atlas Notes

- The first atlas is a static SVG/CSS world-plane scatter view, not a geographic
  map engine. It projects each record's `coordinates.lat` and `coordinates.lon`
  onto a simple equirectangular plane so the app stays static-hosting friendly,
  privacy-respecting, and dependency-light.
- The atlas is intended as orientation and palette browsing, not as a precise
  cartographic product. Future PRs can improve projection details, collision
  handling, or optional map layers without changing the data model.

## Export Notes

- JSON, city-scoped CSS variables, GPL palette text, HEX copy, and the ASE text
  placeholder are generated from the full palette array, so variable-length
  palettes are preserved.
- CSS exports use city-scoped variable names such as
  `--chromapolis-lisbon-1-limestone-cream` to make pasted palettes safer in
  multi-city design systems.
- The ASE control currently downloads a plain-text `.ase.txt` placeholder only;
  it is intentionally labeled as a placeholder until real binary Adobe Swatch
  Exchange generation is implemented.

## Scripts

- `npm run dev` – start local development server
- `npm run build` – type-check and create production build
- `npm run preview` – preview the production build locally

## License

This repository currently includes a `LICENSE` file.

### Open source license recommendation

If you decide to revisit licensing, good options for this type of project include:

- MIT (very permissive)
- Apache-2.0 (permissive with explicit patent grant)
- GPL-3.0-or-later (strong copyleft)

Choose based on your contribution and redistribution goals.
