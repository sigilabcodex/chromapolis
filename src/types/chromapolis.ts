export type PaletteLayer =
  | 'official'
  | 'historical'
  | 'natural'
  | 'architectural'
  | 'cultural'
  | 'symbolic'
  | 'editorial';

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface PaletteColor {
  hex: string;
  name: string;
  layer: PaletteLayer;
  rationale: string;
  confidence: number;
  official: boolean;
  prominence: number;
}

export interface SourceReference {
  title: string;
  url: string;
  publisher: string;
  sourceType: 'government' | 'academic' | 'media' | 'community' | 'editorial' | 'other';
  note?: string;
}

export interface City {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  region?: string;
  coordinates: Coordinates;
  population?: number;
  palette: PaletteColor[];
  sources: SourceReference[];
  notes?: string;
  editorialSummary: string;
}

export interface RegionSummary {
  name: string;
  countryCode: string;
  cityCount: number;
  topLayers: PaletteLayer[];
}

export interface CountrySummary {
  name: string;
  countryCode: string;
  cityCount: number;
  regions: RegionSummary[];
}
