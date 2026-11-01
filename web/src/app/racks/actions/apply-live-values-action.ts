import { toTelemetrySample } from '@/app/devices/actions/get-latest-telemetry-sample-action';
import type { RackSummary } from '@/interfaces/rack-summary';
import { resolveRackStatus } from '@/lib/rack-status';
import type { EntityData } from '@/services/api/interfaces/get-entities-query-response';

type LatestValues = EntityData['latest'];

export const mergeLatestValues = (previous: LatestValues = {}, next: LatestValues): LatestValues => ({
  TIME_SERIES: { ...previous.TIME_SERIES, ...next.TIME_SERIES },
  ATTRIBUTE: { ...previous.ATTRIBUTE, ...next.ATTRIBUTE },
});

export const applyLiveValuesAction = (summary: RackSummary, latest: LatestValues): RackSummary => {
  const timeSeries = latest.TIME_SERIES ?? {};
  const status = resolveRackStatus(timeSeries.status?.value, latest.ATTRIBUTE?.active?.value === 'true');
  const impact = timeSeries.impact_g;
  const telemetry = Object.fromEntries(Object.entries(timeSeries).map(([key, value]) => [key, [value]]));

  return {
    ...summary,
    status,
    latest: status === 'offline' ? undefined : toTelemetrySample(telemetry),
    lastImpact: impact?.ts ? { ts: impact.ts, impactG: Number(impact.value) } : summary.lastImpact,
  };
}
