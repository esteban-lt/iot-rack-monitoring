import type { RackSummary } from '@/interfaces/rack-summary';
import { getRackWithTelemetryAction } from '@/app/racks/actions/get-rack-with-telemetry-action';
import { getRacksAction } from '@/app/racks/actions/get-racks-action';
import { getThresholdsAction } from '@/app/racks/actions/get-thresholds-action';

export const getDashboardAction = async (): Promise<RackSummary[]> => {
  const racks = await getRacksAction();

  return Promise.all(racks.map(async (summary) => {
    const { nodeId } = summary.rack;
    const [withTelemetry, thresholds] = await Promise.all([
      getRackWithTelemetryAction(summary),
      nodeId ? getThresholdsAction(nodeId) : undefined,
    ]);

    return { ...withTelemetry, thresholds };
  }));
}
