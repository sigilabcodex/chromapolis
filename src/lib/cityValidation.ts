import type { City, PaletteLayer, SourceReference } from '../types/chromapolis';

const layers: PaletteLayer[] = [
  'official',
  'historical',
  'natural',
  'architectural',
  'cultural',
  'symbolic',
  'editorial',
];

const sourceTypes: SourceReference['sourceType'][] = [
  'government',
  'academic',
  'media',
  'community',
  'editorial',
  'other',
];

const hexPattern = /^#([0-9A-Fa-f]{6})$/;

export function validateCityRecord(value: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!value || typeof value !== 'object') {
    return { valid: false, errors: ['Record must be an object.'] };
  }

  const city = value as Partial<City>;

  if (!city.slug) errors.push('slug is required.');
  if (!city.name) errors.push('name is required.');
  if (!city.country) errors.push('country is required.');
  if (!city.countryCode || city.countryCode.length !== 2) {
    errors.push('countryCode is required and should be ISO 3166-1 alpha-2.');
  }

  if (!city.coordinates || typeof city.coordinates !== 'object') {
    errors.push('coordinates are required.');
  } else {
    if (typeof city.coordinates.lat !== 'number' || city.coordinates.lat < -90 || city.coordinates.lat > 90) {
      errors.push('coordinates.lat must be a number between -90 and 90.');
    }
    if (typeof city.coordinates.lon !== 'number' || city.coordinates.lon < -180 || city.coordinates.lon > 180) {
      errors.push('coordinates.lon must be a number between -180 and 180.');
    }
  }

  if (!Array.isArray(city.palette) || city.palette.length === 0) {
    errors.push('palette must be a non-empty array.');
  } else {
    city.palette.forEach((color, index) => {
      if (!hexPattern.test(color.hex)) errors.push(`palette[${index}].hex must be #RRGGBB.`);
      if (!layers.includes(color.layer)) errors.push(`palette[${index}].layer is invalid.`);
      if (typeof color.confidence !== 'number' || color.confidence < 0 || color.confidence > 1) {
        errors.push(`palette[${index}].confidence must be between 0 and 1.`);
      }
      if (typeof color.prominence !== 'number' || color.prominence < 0 || color.prominence > 1) {
        errors.push(`palette[${index}].prominence must be between 0 and 1.`);
      }
    });
  }

  if (!Array.isArray(city.sources) || city.sources.length === 0) {
    errors.push('sources must be a non-empty array.');
  } else {
    city.sources.forEach((source, index) => {
      if (!sourceTypes.includes(source.sourceType)) {
        errors.push(`sources[${index}].sourceType is invalid.`);
      }
    });
  }

  if (!city.editorialSummary) {
    errors.push('editorialSummary is required.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
