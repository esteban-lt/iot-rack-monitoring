import type { RackSummary } from '@/interfaces/rack-summary';
import { rackApi } from '../api/rack-api';
import { getRackSummaryAction } from './get-rack-summary-action';
import { getRackWithTelemetryAction } from './get-rack-with-telemetry-action';

export const getRackAction = async (rackId: string): Promise<RackSummary> => {
  const asset = await rackApi.getAsset(rackId);
  const summary = await getRackSummaryAction(asset);

  return getRackWithTelemetryAction(summary);
}
