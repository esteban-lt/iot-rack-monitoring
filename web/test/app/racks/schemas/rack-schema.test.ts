import { describe, expect, it } from 'vitest';
import { createRackSchema, normalizeRfidUid } from '@/app/racks/schemas/rack-schema';
import type { RackSummary } from '@/interfaces/rack-summary';

const existing: RackSummary[] = [
  { rack: { id: 'r1', name: 'A1', location: 'Bodega', rfidUid: 'AABBCCDD' }, status: 'ok' },
];

const valid = { name: 'B2', location: 'Bodega', rfidUid: '11223344' };

const errors = (input: object, rackId?: string) =>
  createRackSchema(existing, rackId).safeParse(input).error?.issues.map(({ message }) => message) ?? [];

describe('normalizeRfidUid', () => {
  it('uppercases and strips separators', () => {
    expect(normalizeRfidUid('aa:bb cc-dd')).toBe('AABBCCDD');
  });
});

describe('createRackSchema', () => {
  it('accepts a new rack', () => {
    expect(errors(valid)).toEqual([]);
  });

  it('accepts 8, 14 and 20 character tags only', () => {
    expect(errors({ ...valid, rfidUid: '11223344556677' })).toEqual([]);
    expect(errors({ ...valid, rfidUid: '11223344556677889900' })).toEqual([]);
    expect(errors({ ...valid, rfidUid: '1122334455' })).toHaveLength(1);
  });

  it('rejects a name or tag already used by another rack', () => {
    expect(errors({ ...valid, name: 'a1' })).toEqual(['Ya existe un rack con ese nombre']);
    expect(errors({ ...valid, rfidUid: 'AABBCCDD' })).toEqual(['Ese UID ya pertenece a otro rack']);
  });

  it('lets a rack keep its own name and tag when edited', () => {
    expect(errors({ name: 'A1', location: 'Bodega', rfidUid: 'AABBCCDD' }, 'r1')).toEqual([]);
  });
});
