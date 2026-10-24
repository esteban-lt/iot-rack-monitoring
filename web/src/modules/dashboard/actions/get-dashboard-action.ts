import type { ImpactEvent } from '@/interfaces/impact-event';
import type { RackSummary } from '@/interfaces/rack-summary';
import { getLatestTelemetrySampleAction } from '@/modules/devices/actions/get-latest-telemetry-sample-action';
import { deviceApi } from '@/modules/devices/api/device-api';
import { getRacksAction } from '@/modules/racks/actions/get-racks-action';

const getLastImpact = async (nodeId: string): Promise<ImpactEvent | undefined> => {
  const telemetry = await deviceApi.getLatestTelemetry(nodeId, ['impact_g']);
  const impact = telemetry.impact_g?.[0];

  return impact ? { ts: impact.ts, impactG: Number(impact.value) } : undefined;
}

export const getDashboardAction = async (): Promise<RackSummary[]> => {
  const racks = await getRacksAction();

  return Promise.all(
    racks.map(async (summary): Promise<RackSummary> => {
      const { nodeId } = summary.rack;
      if (!nodeId) return summary;

      const [latest, lastImpact] = await Promise.all([
        summary.status === 'offline' ? undefined : getLatestTelemetrySampleAction(nodeId),
        getLastImpact(nodeId),
      ]);

      return { ...summary, latest, lastImpact };
    }),
  );
}
