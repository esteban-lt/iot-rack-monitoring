import type { RackSummary } from '@/interfaces/rack-summary';
import { getLastImpactAction } from '@/app/devices/actions/get-last-impact-action';
import { getLatestTelemetrySampleAction } from '@/app/devices/actions/get-latest-telemetry-sample-action';

export const getRackWithTelemetryAction = async (summary: RackSummary): Promise<RackSummary> => {
  const { nodeId } = summary.rack;
  if (!nodeId) return summary;

  const [latest, lastImpact] = await Promise.all([
    summary.status === 'offline' ? undefined : getLatestTelemetrySampleAction(nodeId),
    getLastImpactAction(nodeId),
  ]);

  return { ...summary, latest, lastImpact };
}
