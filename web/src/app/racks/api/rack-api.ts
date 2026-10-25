import { thingsboardClient } from '@/services/api/thingsboard-client';
import type { GetAttributesResponse } from '../interfaces/get-attributes-response';
import type { Data as Asset, GetAssetsResponse } from '../interfaces/get-assets-response';
import type { GetRelationsResponse } from '../interfaces/get-relations-response';

export const rackApi = {
  getAssets: async (pageSize: number = 50, page: number = 0): Promise<GetAssetsResponse> => {
    const { data } = await thingsboardClient.get('/api/tenant/assets', {
      params: {
        pageSize,
        page,
      },
    });
    return data;
  },

  getAsset: async (assetId: string): Promise<Asset> => {
    const { data } = await thingsboardClient.get(`/api/asset/${assetId}`);
    return data;
  },

  getAttributes: async (assetId: string, keys: string[] = ['rack_name', 'location', 'rfid_uid']): Promise<GetAttributesResponse[]> => {
    const { data } = await thingsboardClient.get(`/api/plugins/telemetry/ASSET/${assetId}/values/attributes/SERVER_SCOPE`, {
      params: {
        keys: keys.join(',')
      },
    });
    return data;
  },

  getAssignedNodes: async (assetId: string): Promise<GetRelationsResponse[]> => {
    const { data } = await thingsboardClient.get('/api/relations/info', {
      params: {
        fromId: assetId,
        fromType: 'ASSET',
        relationType: 'Contains',
      },
    });
    return data;
  },
};
