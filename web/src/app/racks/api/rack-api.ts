import { thingsboardClient } from '@/services/api/thingsboard-client';
import type { GetAttributesResponse } from '../interfaces/get-attributes-response';
import type { Data as Asset, GetAssetsResponse } from '../interfaces/get-assets-response';
import type { GetEntitiesQueryResponse } from '@/services/api/interfaces/get-entities-query-response';

export const rackApi = {
  getAssets: async (pageSize: number = 50, page: number = 0): Promise<GetAssetsResponse> => {
    const { data } = await thingsboardClient.get('/api/tenant/assets', {
      params: {
        pageSize,
        page,
        type: 'Rack',
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

  getRackTags: async (): Promise<GetEntitiesQueryResponse> => {
    const { data } = await thingsboardClient.post('/api/entitiesQuery/find', {
      entityFilter: { type: 'assetType', assetTypes: ['Rack'] },
      pageLink: { page: 0, pageSize: 1000 },
      entityFields: [{ type: 'ENTITY_FIELD', key: 'name' }],
      latestValues: [
        { type: 'SERVER_ATTRIBUTE', key: 'rfid_uid' },
        { type: 'SERVER_ATTRIBUTE', key: 'rack_name' },
      ],
    });
    return data;
  },

  createAsset: async (name: string): Promise<Asset> => {
    const { data } = await thingsboardClient.post('/api/asset', { name, type: 'Rack' });
    return data;
  },

  saveAttributes: async (assetId: string, attributes: Record<string, string>): Promise<void> => {
    await thingsboardClient.post(`/api/plugins/telemetry/ASSET/${assetId}/attributes/SERVER_SCOPE`, attributes);
  },
};
