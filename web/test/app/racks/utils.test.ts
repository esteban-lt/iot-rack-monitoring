import { describe, expect, it } from 'vitest';
import { filterRacks, sortRacks } from '@/app/racks/utils';
import type { RackStatus, RackSummary } from '@/interfaces/rack-summary';

const rack = (name: string, status: RackStatus, tilt?: number, extra: Partial<RackSummary['rack']> = {}): RackSummary => ({
  rack: { id: name, name, location: 'Bodega', ...extra },
  status,
  latest: tilt === undefined ? undefined : { tilt } as RackSummary['latest'],
});

const names = (summaries: RackSummary[]) => summaries.map(({ rack }) => rack.name);

describe('sortRacks', () => {
  const racks = [rack('Rack 10', 'ok', 1), rack('Rack 2', 'alarm', 9), rack('Rack 1', 'offline'), rack('Rack 3', 'warning', 4)];

  it('puts the most critical racks first', () => {
    expect(names(sortRacks(racks, 'critical'))).toEqual(['Rack 2', 'Rack 3', 'Rack 10', 'Rack 1']);
  });

  it('sorts names numerically', () => {
    expect(names(sortRacks(racks, 'name'))).toEqual(['Rack 1', 'Rack 2', 'Rack 3', 'Rack 10']);
  });

  it('sorts by tilt with racks without data last', () => {
    expect(names(sortRacks(racks, 'tilt'))).toEqual(['Rack 2', 'Rack 3', 'Rack 10', 'Rack 1']);
  });

  it('does not mutate the input', () => {
    const before = names(racks);
    sortRacks(racks, 'name');
    expect(names(racks)).toEqual(before);
  });
});

describe('filterRacks', () => {
  const racks = [
    rack('A1', 'ok', 1, { location: 'Pasillo norte', nodeName: 'rack-node-01', rfidUid: 'AABBCCDD' }),
    rack('B2', 'alarm', 12, { location: 'Pasillo sur' }),
  ];

  it('filters by status', () => {
    expect(names(filterRacks(racks, '', 'alarm'))).toEqual(['B2']);
    expect(names(filterRacks(racks, '', 'all'))).toEqual(['A1', 'B2']);
  });

  it('searches name, location, node and RFID tag ignoring case', () => {
    expect(names(filterRacks(racks, 'b2', 'all'))).toEqual(['B2']);
    expect(names(filterRacks(racks, ' NORTE ', 'all'))).toEqual(['A1']);
    expect(names(filterRacks(racks, 'node-01', 'all'))).toEqual(['A1']);
    expect(names(filterRacks(racks, 'ccdd', 'all'))).toEqual(['A1']);
  });

  it('combines search and status', () => {
    expect(filterRacks(racks, 'pasillo', 'warning')).toEqual([]);
  });
});
