# Chromapolis

**A Chromatic Atlas of Cities**

Chromapolis is a FLOSS, privacy-respecting web app concept for exploring city color
palettes. This MVP is intentionally lightweight and static-first.

## Principles

- Open source and maintainable
- Privacy by default (no tracking, no analytics, no login)
- Human-auditable dataset formats in plain text
- Accessible and readable interface
- Local-first friendly architecture

## Project Structure

```text
.
├── data/
├── docs/
├── src/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   └── types/
├── index.html
├── package.json
└── vite.config.ts
```


## Data Model

- TypeScript model: `src/types/chromapolis.ts`
- Methodology and field documentation: `docs/data-model.md`
- JSON schema and examples: `data/cities/`

## Setup

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite (usually `http://localhost:5173`).

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
