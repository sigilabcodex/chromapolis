# Compare Mode

## Purpose
Compare Mode turns Chromapolis into a comparative atlas workflow for 2–4 cities. It is designed to help readers inspect color relationships and semantic layer overlap, not to produce a generic score.

## Near chromatic correspondences
- Method: every cross-city color pair is converted from HEX to CIELAB.
- Distance metric: ΔE76.
- Current threshold: `ΔE <= 18` is treated as a near chromatic correspondence.
- Interpretation labels:
  - `ΔE <= 8`: very close perceptual correspondence
  - `8 < ΔE <= 18`: near chromatic correspondence

This avoids naive hex-string matching and provides an explainable, dependency-light heuristic.

## Strong contrast derivation
- Method: relative luminance is computed from linearized sRGB channels.
- Contrast signal: WCAG contrast ratio `(L1 + 0.05) / (L2 + 0.05)`.
- Ranking: descending by contrast ratio, then luminance delta.

This gives a practical visual contrast model that maps to legibility and perceived separation.

## Shared layer summary
Shared layers are evaluated against the canonical layer set:
- official
- historical
- natural
- architectural
- cultural
- symbolic
- editorial

For each layer the comparison result records:
- count of cities where the layer appears
- coverage ratio across selected cities
- per-city color count
- per-city average prominence
- a `prominent` flag (`average prominence >= 0.6`)

Only layers present in at least two selected cities are surfaced as shared.

## Confidence and status profile
Chromapolis currently derives status from palette confidence and city notes:
- `verified`: average confidence >= 0.82 and no draft/provisional wording in notes
- `mixed`: middle range confidence
- `provisional`: average confidence < 0.7 or notes indicate draft/provisional data

This status is surfaced so users can contextualize comparison quality.

## Current limitations
- ΔE76 is a first-pass perceptual heuristic; future iterations may use ΔE2000.
- Contrast analysis currently compares all cross-city swatch pairs and does not yet cluster by layer before ranking.
- Status inference is heuristic because city records do not yet include an explicit verification field.
- If the loaded dataset has fewer than two city records, compare mode remains in empty state.
