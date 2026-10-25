import type { ImpactEvent } from '@/interfaces/impact-event';
import { deviceApi } from '../api/device-api';

export const getLastImpactAction = async (deviceId: string): Promise<ImpactEvent | undefined> => {
  const telemetry = await deviceApi.getLatestTelemetry(deviceId, ['impact_g']);
  const impact = telemetry.impact_g?.[0];

  return impact ? { ts: impact.ts, impactG: Number(impact.value) } : undefined;
}
