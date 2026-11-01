import type { RackSummary } from '@/interfaces/rack-summary';
import { rackApi } from '../api/rack-api';
import { getRackSummaryAction } from './get-rack-summary-action';
import { getRfidLinksAction } from './get-rfid-links-action';
import { getRackWithTelemetryAction } from './get-rack-with-telemetry-action';

export const getRackAction = async (rackId: string): Promise<RackSummary> => {
  const [asset, links] = await Promise.all([rackApi.getAsset(rackId), getRfidLinksAction()]);
  const summary = await getRackSummaryAction(asset, links);

  return getRackWithTelemetryAction(summary);
}
