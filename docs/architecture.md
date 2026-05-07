# Chromapolis MVP Notes

- Frontend-only, static-first architecture.
- No analytics, tracking scripts, account system, or cookies by default.
- The v0.3 visual atlas is an in-app SVG/CSS world-plane scatter view built from
  city coordinates; it intentionally avoids Mapbox, Leaflet, OpenLayers, D3,
  analytics, and remote map tiles.
- Future map integration can be implemented as an optional UI layer if the
  project needs higher cartographic fidelity.
- Future dataset ingestion should load local files from `data/` for local-first
  usage.

## Visual atlas decision

The initial atlas is static rather than a full map library because ChromaPolis is
GitHub Pages-friendly and privacy-respecting. A simple equirectangular scatter
plane is enough to make the project feel atlas-like, lets city marker clicks
reuse existing selection state, and avoids introducing networked tiles, API keys,
or heavy runtime dependencies in this focused v0.3 slice.
