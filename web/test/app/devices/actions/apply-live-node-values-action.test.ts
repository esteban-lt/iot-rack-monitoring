import { describe, expect, it } from 'vitest';
import { applyLiveNodeValuesAction } from '@/app/devices/actions/apply-live-node-values-action';
import type { NodeSummary } from '@/interfaces/node-summary';

const value = (v: string | number) => ({ ts: 1000, value: String(v) });

const summary = (isActive: boolean): NodeSummary => ({ node: { id: 'n1', name: 'rack-node-01', isActive } });

describe('applyLiveNodeValuesAction', () => {
  it('keeps the previous connection state when the update does not include it', () => {
    const result = applyLiveNodeValuesAction(summary(true), { TIME_SERIES: { status: value('ok'), rssi: value(-55) } });

    expect(result.node.isActive).toBe(true);
    expect(result.latest).toMatchObject({ status: 'ok', rssi: -55 });
  });

  it('marks the node offline and drops its telemetry', () => {
    const result = applyLiveNodeValuesAction(summary(true), {
      TIME_SERIES: { status: value('ok') },
      ATTRIBUTE: { active: value('false') },
    });

    expect(result.node.isActive).toBe(false);
    expect(result.latest).toBeUndefined();
  });

  it('keeps the last sample when the update has no valid status', () => {
    const previous = applyLiveNodeValuesAction(summary(true), { TIME_SERIES: { status: value('ok'), rssi: value(-55) } });
    const result = applyLiveNodeValuesAction(previous, { TIME_SERIES: { rssi: value(-70) } });

    expect(result.latest).toEqual(previous.latest);
  });
});
