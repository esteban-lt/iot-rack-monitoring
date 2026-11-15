import { describe, expect, it } from 'vitest';
import type { RackStatus, RackSummary } from '@/interfaces/rack-summary';
import { countByStatus, resolveRackStatus } from '@/lib/rack-status';

const summary = (status: RackStatus): RackSummary => ({ rack: { id: status, name: status, location: '' }, status });

describe('resolveRackStatus', () => {
  it('is offline when the node is inactive, whatever it reported', () => {
    expect(resolveRackStatus('alarm', false)).toBe('offline');
  });

  it('keeps a known status from an active node', () => {
    expect(resolveRackStatus('ok', true)).toBe('ok');
    expect(resolveRackStatus('warning', true)).toBe('warning');
    expect(resolveRackStatus('alarm', true)).toBe('alarm');
  });

  it('falls back to offline for missing or unknown statuses', () => {
    expect(resolveRackStatus(undefined, true)).toBe('offline');
    expect(resolveRackStatus('calibrating', true)).toBe('offline');
  });
});

describe('countByStatus', () => {
  it('counts racks with the given status', () => {
    const summaries = ['ok', 'alarm', 'ok', 'offline'].map((status) => summary(status as RackStatus));
    expect(countByStatus(summaries, 'ok')).toBe(2);
    expect(countByStatus(summaries, 'warning')).toBe(0);
  });
});
