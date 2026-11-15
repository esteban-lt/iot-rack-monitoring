import { describe, expect, it } from 'vitest';
import { applyLiveValuesAction, mergeLatestValues, rackTagChanged } from '@/app/racks/actions/apply-live-values-action';
import type { RackSummary } from '@/interfaces/rack-summary';

const value = (v: string | number, ts = 1000) => ({ ts, value: String(v) });

const summary: RackSummary = {
  rack: { id: 'r1', name: 'A1', location: 'Bodega', nodeId: 'n1' },
  status: 'ok',
  lastImpact: { ts: 500, impactG: 2 },
};

describe('mergeLatestValues', () => {
  it('keeps previous keys and overrides the ones that changed', () => {
    const previous = { TIME_SERIES: { tilt: value(1), rssi: value(-60) }, ATTRIBUTE: { active: value('true') } };
    const merged = mergeLatestValues(previous, { TIME_SERIES: { tilt: value(3) } });

    expect(merged.TIME_SERIES).toEqual({ tilt: value(3), rssi: value(-60) });
    expect(merged.ATTRIBUTE).toEqual({ active: value('true') });
  });
});

describe('rackTagChanged', () => {
  const withTag = (tag: string) => ({ ATTRIBUTE: { rack_uid: value(tag) } });

  it('is false on the first update, when there is nothing to compare', () => {
    expect(rackTagChanged(undefined, withTag('AABBCCDD'))).toBe(false);
  });

  it('is false while the tag stays the same', () => {
    expect(rackTagChanged(withTag('AABBCCDD'), withTag('AABBCCDD'))).toBe(false);
  });

  it('is true when the node reads another tag', () => {
    expect(rackTagChanged(withTag('AABBCCDD'), withTag('11223344'))).toBe(true);
  });
});

describe('applyLiveValuesAction', () => {
  it('maps live telemetry from an active node', () => {
    const result = applyLiveValuesAction(summary, {
      TIME_SERIES: { status: value('warning', 2000), tilt: value(6.5), tilt_x: value(-2) },
      ATTRIBUTE: { active: value('true') },
    });

    expect(result.status).toBe('warning');
    expect(result.latest).toMatchObject({ ts: 2000, tilt: 6.5, tiltX: -2, status: 'warning' });
    expect(result.lastImpact).toEqual(summary.lastImpact);
  });

  it('drops telemetry when the node goes offline', () => {
    const result = applyLiveValuesAction(summary, {
      TIME_SERIES: { status: value('ok'), tilt: value(1) },
      ATTRIBUTE: { active: value('false') },
    });

    expect(result.status).toBe('offline');
    expect(result.latest).toBeUndefined();
  });

  it('updates the last impact when a new one arrives', () => {
    const result = applyLiveValuesAction(summary, {
      TIME_SERIES: { status: value('alarm'), impact_g: value(3.2, 3000) },
      ATTRIBUTE: { active: value('true') },
    });

    expect(result.lastImpact).toEqual({ ts: 3000, impactG: 3.2 });
  });
});
