import { expect, test } from '@playwright/test';
import { SECTOR_IMAGE_KEYS, isSectorImageKey } from '../src/config/assetKeys';
import { SECTOR_DEFINITIONS, resolveSectorRoute, validateSectorRegistry } from '../src/data/sectors';

test.describe('Sector route registry', () => {
  test('16 sector links resolve with unique slugs and routes', () => {
    const validation = validateSectorRegistry();
    expect(validation.errors, validation.errors.join('; ')).toEqual([]);
    expect(validation.ok).toBe(true);
    expect(SECTOR_DEFINITIONS).toHaveLength(16);
  });

  test('every sector has a canonical imageKey in assets registry', () => {
    for (const sector of SECTOR_DEFINITIONS) {
      expect(isSectorImageKey(sector.imageKey), `${sector.slug} invalid imageKey`).toBe(true);
    }
    expect(SECTOR_IMAGE_KEYS).toHaveLength(16);
  });

  test('special and generic sector routes remain reachable paths', () => {
    expect(resolveSectorRoute('build-villa')).toBe('/journeys/build-villa');
    expect(resolveSectorRoute('investment')).toBe('/invest');
    expect(resolveSectorRoute('engineering-consulting')).toBe('/engineering-services');
    expect(resolveSectorRoute('facility-management')).toBe('/sectors/facility-management');
    expect(resolveSectorRoute('unknown-sector')).toBeUndefined();
  });
});
