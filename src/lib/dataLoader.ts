import type { City } from '../types/chromapolis';
import { validateCityRecord } from './cityValidation';

import cityManifest from '../../data/cities/index.json';
import lisbonPt from '../../data/cities/lisbon-pt.json';
import tokyoJp from '../../data/cities/tokyo-jp.json';
import nairobiKe from '../../data/cities/nairobi-ke.json';
import mexicoCityMx from '../../data/cities/mexico-city-mx.json';

interface CityManifestEntry {
  slug: string;
  countryCode: string;
  file: string;
}

interface CityManifest {
  cities: CityManifestEntry[];
}

interface DataLoadDiagnostics {
  errors: string[];
  invalidEntries: number;
  loadedEntries: number;
}

const cityFileRegistry: Record<string, unknown> = {
  'lisbon-pt.json': lisbonPt,
  'tokyo-jp.json': tokyoJp,
  'nairobi-ke.json': nairobiKe,
  'mexico-city-mx.json': mexicoCityMx,
};

function normalizeCountryCode(value: string): string {
  return value.trim().toUpperCase();
}

function isManifest(value: unknown): value is CityManifest {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybeManifest = value as Partial<CityManifest>;
  if (!Array.isArray(maybeManifest.cities)) {
    return false;
  }

  return maybeManifest.cities.every((entry) => {
    if (!entry || typeof entry !== 'object') {
      return false;
    }

    const candidate = entry as Partial<CityManifestEntry>;
    return (
      typeof candidate.slug === 'string' &&
      candidate.slug.length > 0 &&
      typeof candidate.countryCode === 'string' &&
      candidate.countryCode.length === 2 &&
      typeof candidate.file === 'string' &&
      candidate.file.length > 0
    );
  });
}

function loadCitiesFromManifest(manifestData: unknown): {
  cities: City[];
  diagnostics: DataLoadDiagnostics;
} {
  const diagnostics: DataLoadDiagnostics = {
    errors: [],
    invalidEntries: 0,
    loadedEntries: 0,
  };

  if (!isManifest(manifestData)) {
    diagnostics.errors.push('City manifest is missing or malformed.');
    return { cities: [], diagnostics };
  }

  if (manifestData.cities.length === 0) {
    diagnostics.errors.push('City manifest contains no entries.');
    return { cities: [], diagnostics };
  }

  const validCities: City[] = [];

  for (const entry of manifestData.cities) {
    const rawCityRecord = cityFileRegistry[entry.file];

    if (!rawCityRecord) {
      diagnostics.invalidEntries += 1;
      diagnostics.errors.push(`Manifest entry "${entry.slug}" references missing file "${entry.file}".`);
      continue;
    }

    const validation = validateCityRecord(rawCityRecord);
    if (!validation.valid) {
      diagnostics.invalidEntries += 1;
      diagnostics.errors.push(
        `City record "${entry.file}" is invalid: ${validation.errors.join(' ')}`,
      );
      continue;
    }

    const city = rawCityRecord as City;

    if (city.slug !== entry.slug) {
      diagnostics.invalidEntries += 1;
      diagnostics.errors.push(
        `Manifest slug "${entry.slug}" does not match city file slug "${city.slug}" for "${entry.file}".`,
      );
      continue;
    }

    if (normalizeCountryCode(city.countryCode) !== normalizeCountryCode(entry.countryCode)) {
      diagnostics.invalidEntries += 1;
      diagnostics.errors.push(
        `Manifest countryCode "${entry.countryCode}" does not match city file countryCode "${city.countryCode}" for "${entry.file}".`,
      );
      continue;
    }

    validCities.push(city);
    diagnostics.loadedEntries += 1;
  }

  return { cities: validCities, diagnostics };
}

const loadedData = loadCitiesFromManifest(cityManifest);

if (loadedData.diagnostics.errors.length > 0) {
  loadedData.diagnostics.errors.forEach((error) => {
    console.warn(`[dataLoader] ${error}`);
  });
}

export function getAllCities(): City[] {
  return [...loadedData.cities];
}

export function getCityBySlug(slug: string): City | null {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return null;
  }

  return loadedData.cities.find((city) => city.slug.toLowerCase() === normalizedSlug) ?? null;
}

export function getCitiesByCountry(countryCode: string): City[] {
  const normalizedCode = normalizeCountryCode(countryCode);
  if (!normalizedCode) {
    return [];
  }

  return loadedData.cities.filter((city) => normalizeCountryCode(city.countryCode) === normalizedCode);
}

export function getDataLoadDiagnostics(): DataLoadDiagnostics {
  return {
    errors: [...loadedData.diagnostics.errors],
    invalidEntries: loadedData.diagnostics.invalidEntries,
    loadedEntries: loadedData.diagnostics.loadedEntries,
  };
}
