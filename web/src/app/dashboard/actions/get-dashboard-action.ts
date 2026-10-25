import type { RackSummary } from '@/interfaces/rack-summary';
import { getRackWithTelemetryAction } from '@/app/racks/actions/get-rack-with-telemetry-action';
import { getRacksAction } from '@/app/racks/actions/get-racks-action';

export const getDashboardAction = async (): Promise<RackSummary[]> => {
  const racks = await getRacksAction();

  return Promise.all(racks.map(getRackWithTelemetryAction));
}
