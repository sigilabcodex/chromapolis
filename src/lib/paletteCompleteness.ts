export type PaletteCompleteness = 'Minimal' | 'Standard' | 'Complete';

export function getPaletteCompleteness(colorCount: number): PaletteCompleteness {
  if (colorCount <= 3) return 'Minimal';
  if (colorCount <= 6) return 'Standard';
  return 'Complete';
}
