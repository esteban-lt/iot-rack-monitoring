import type { RackSummary } from '@/interfaces/rack-summary';
import { rackApi } from '../api/rack-api';
import { getRackSummaryAction } from './get-rack-summary-action';
import { getRfidLinksAction } from './get-rfid-links-action';

export const getRacksAction = async (pageSize: number = 50, page: number = 0): Promise<RackSummary[]> => {
  const validatedPageSize = (pageSize > 0) ? pageSize : 50;
  const validatedPage = (page >= 0) ? page : 0;

  const [assets, links] = await Promise.all([
    rackApi.getAssets(validatedPageSize, validatedPage),
    getRfidLinksAction(),
  ]);

  return Promise.all(assets.data.map((asset) => getRackSummaryAction(asset, links)));
}
