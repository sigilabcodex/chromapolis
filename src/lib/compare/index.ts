import type { City, PaletteColor, PaletteLayer } from '../../types/chromapolis';

export interface ComparedColor {
  citySlug: string;
  cityName: string;
  hex: string;
  name: string;
  layer: PaletteLayer;
  confidence: number;
  prominence: number;
}

export interface ColorMatch {
  pair: [ComparedColor, ComparedColor];
  deltaE: number;
  interpretation: string;
}

export interface ColorContrast {
  pair: [ComparedColor, ComparedColor];
  contrastRatio: number;
  luminanceDelta: number;
  interpretation: string;
}

export interface SharedLayerSummary {
  layer: PaletteLayer;
  cityCount: number;
  coverage: number;
  perCity: Array<{
    citySlug: string;
    cityName: string;
    colorCount: number;
    averageProminence: number;
    prominent: boolean;
  }>;
}

export type DataStatus = 'verified' | 'mixed' | 'provisional';

export interface ConfidenceStatus {
  citySlug: string;
  cityName: string;
  status: DataStatus;
  averageConfidence: number;
  caveat: string;
}

export interface CityComparisonResult {
  selectedCities: Array<{ slug: string; name: string; country: string; countryCode: string }>;
  nearChromaticCorrespondences: ColorMatch[];
  strongestContrasts: ColorContrast[];
  sharedLayers: SharedLayerSummary[];
  confidenceProfile: ConfidenceStatus[];
  aggregateNotes: string[];
  exportPayload: {
    generatedAt: string;
    citySlugs: string[];
    caveats: string[];
  };
}

const ALL_LAYERS: PaletteLayer[] = [
  'official',
  'historical',
  'natural',
  'architectural',
  'cultural',
  'symbolic',
  'editorial',
];

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
}

function srgbToLinear(channel: number): number {
  const n = channel / 255;
  return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}

function hexToLab(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);

  const x = (0.4124 * rl + 0.3576 * gl + 0.1805 * bl) / 0.95047;
  const y = (0.2126 * rl + 0.7152 * gl + 0.0722 * bl) / 1;
  const z = (0.0193 * rl + 0.1192 * gl + 0.9505 * bl) / 1.08883;

  const f = (value: number) => (value > 0.008856 ? value ** (1 / 3) : 7.787 * value + 16 / 116);

  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function deltaE76(hexA: string, hexB: string): number {
  const labA = hexToLab(hexA);
  const labB = hexToLab(hexB);
  return Math.sqrt((labA.l - labB.l) ** 2 + (labA.a - labB.a) ** 2 + (labA.b - labB.b) ** 2);
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const rl = srgbToLinear(r);
  const gl = srgbToLinear(g);
  const bl = srgbToLinear(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(hexA: string, hexB: string): number {
  const l1 = luminance(hexA);
  const l2 = luminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function toComparedColor(city: City, color: PaletteColor): ComparedColor {
  return {
    citySlug: city.slug,
    cityName: city.name,
    hex: color.hex,
    name: color.name,
    layer: color.layer,
    confidence: color.confidence,
    prominence: color.prominence,
  };
}

function inferStatus(city: City): ConfidenceStatus {
  const averageConfidence = city.palette.reduce((sum, color) => sum + color.confidence, 0) / city.palette.length;
  const note = city.notes?.toLowerCase() ?? '';
  const hasDraftLanguage = note.includes('draft') || note.includes('provisional');

  if (averageConfidence >= 0.82 && !hasDraftLanguage) {
    return {
      citySlug: city.slug,
      cityName: city.name,
      status: 'verified',
      averageConfidence,
      caveat: 'Mostly high-confidence palette evidence.',
    };
  }

  if (averageConfidence < 0.7 || hasDraftLanguage) {
    return {
      citySlug: city.slug,
      cityName: city.name,
      status: 'provisional',
      averageConfidence,
      caveat: 'Interpret with care; low confidence or draft/provisional notes detected.',
    };
  }

  return {
    citySlug: city.slug,
    cityName: city.name,
    status: 'mixed',
    averageConfidence,
    caveat: 'Combination of stronger and weaker confidence signals.',
  };
}

export function compareCities(cities: City[]): CityComparisonResult {
  const nearChromaticCorrespondences: ColorMatch[] = [];
  const strongestContrasts: ColorContrast[] = [];

  for (let i = 0; i < cities.length; i += 1) {
    for (let j = i + 1; j < cities.length; j += 1) {
      const cityA = cities[i];
      const cityB = cities[j];

      cityA.palette.forEach((colorA) => {
        cityB.palette.forEach((colorB) => {
          const comparedA = toComparedColor(cityA, colorA);
          const comparedB = toComparedColor(cityB, colorB);
          const de = deltaE76(colorA.hex, colorB.hex);
          if (de <= 18) {
            nearChromaticCorrespondences.push({
              pair: [comparedA, comparedB],
              deltaE: de,
              interpretation: de <= 8 ? 'Very close perceptual correspondence.' : 'Near chromatic correspondence.',
            });
          }

          const ratio = contrastRatio(colorA.hex, colorB.hex);
          const deltaLum = Math.abs(luminance(colorA.hex) - luminance(colorB.hex));
          strongestContrasts.push({
            pair: [comparedA, comparedB],
            contrastRatio: ratio,
            luminanceDelta: deltaLum,
            interpretation: ratio >= 4.5 ? 'Strong readable contrast.' : 'Moderate contrast relationship.',
          });
        });
      });
    }
  }

  const sharedLayers = ALL_LAYERS
    .map((layer) => {
      const perCity = cities.map((city) => {
        const colors = city.palette.filter((color) => color.layer === layer);
        const averageProminence =
          colors.length > 0 ? colors.reduce((sum, color) => sum + color.prominence, 0) / colors.length : 0;
        return {
          citySlug: city.slug,
          cityName: city.name,
          colorCount: colors.length,
          averageProminence,
          prominent: averageProminence >= 0.6,
        };
      });
      const cityCount = perCity.filter((item) => item.colorCount > 0).length;
      return {
        layer,
        cityCount,
        coverage: cityCount / cities.length,
        perCity,
      };
    })
    .filter((entry) => entry.cityCount >= 2)
    .sort((a, b) => b.coverage - a.coverage || b.cityCount - a.cityCount);

  const confidenceProfile = cities.map(inferStatus);
  const caveats = confidenceProfile
    .filter((entry) => entry.status !== 'verified')
    .map((entry) => `${entry.cityName}: ${entry.caveat}`);

  return {
    selectedCities: cities.map((city) => ({
      slug: city.slug,
      name: city.name,
      country: city.country,
      countryCode: city.countryCode,
    })),
    nearChromaticCorrespondences: nearChromaticCorrespondences.sort((a, b) => a.deltaE - b.deltaE).slice(0, 12),
    strongestContrasts: strongestContrasts
      .sort((a, b) => b.contrastRatio - a.contrastRatio || b.luminanceDelta - a.luminanceDelta)
      .slice(0, 12),
    sharedLayers,
    confidenceProfile,
    aggregateNotes: [
      'Near correspondence uses CIELAB ΔE76 <= 18 across city palettes.',
      'Contrast ranking uses WCAG contrast ratio and luminance delta across city pairs.',
      ...caveats,
    ],
    exportPayload: {
      generatedAt: new Date().toISOString(),
      citySlugs: cities.map((city) => city.slug),
      caveats,
    },
  };
}

export function comparisonToMarkdown(result: CityComparisonResult): string {
  const lines: string[] = [];
  lines.push('# Chromapolis City Comparison');
  lines.push(`Cities: ${result.selectedCities.map((city) => city.name).join(', ')}`);
  lines.push('');
  lines.push('## Near chromatic correspondences');
  if (result.nearChromaticCorrespondences.length === 0) {
    lines.push('- None detected in this selection.');
  } else {
    result.nearChromaticCorrespondences.forEach((match) => {
      const [a, b] = match.pair;
      lines.push(`- ${a.cityName} ${a.name} (${a.hex}) ↔ ${b.cityName} ${b.name} (${b.hex}) — ΔE ${match.deltaE.toFixed(1)}`);
    });
  }
  lines.push('');
  lines.push('## Strong contrasts');
  result.strongestContrasts.slice(0, 8).forEach((contrast) => {
    const [a, b] = contrast.pair;
    lines.push(`- ${a.cityName} ${a.hex} vs ${b.cityName} ${b.hex} — ratio ${contrast.contrastRatio.toFixed(2)}`);
  });
  lines.push('');
  lines.push('## Shared layers');
  if (result.sharedLayers.length === 0) {
    lines.push('- No shared semantic layers across two or more selected cities.');
  } else {
    result.sharedLayers.forEach((layer) => {
      lines.push(`- ${layer.layer}: present in ${layer.cityCount}/${result.selectedCities.length} cities`);
    });
  }
  lines.push('');
  lines.push('## Caveats');
  if (result.exportPayload.caveats.length === 0) {
    lines.push('- No caveats from the current confidence profile.');
  } else {
    result.exportPayload.caveats.forEach((caveat) => lines.push(`- ${caveat}`));
  }
  return lines.join('\n');
}

export function comparisonToCssVariables(result: CityComparisonResult, cities: City[]): string {
  const lines: string[] = [':root {'];
  cities.forEach((city) => {
    city.palette.forEach((color, index) => {
      lines.push(`  --${city.slug}-color-${index + 1}: ${color.hex};`);
    });
  });
  lines.push('}');
  lines.push('');
  lines.push('/* Shared layers */');
  result.sharedLayers.forEach((layer) => {
    lines.push(`/* ${layer.layer}: ${layer.cityCount}/${result.selectedCities.length} cities */`);
  });
  return lines.join('\n');
}
