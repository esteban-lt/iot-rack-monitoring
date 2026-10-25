import { thingsboardClient } from '@/services/api/thingsboard-client';
import type { GetAttributesResponse } from '../interfaces/get-attributes-response';
import type { GetDevicesResponse } from '../interfaces/get-devices-response';
import type { GetTelemetryResponse } from '../interfaces/get-telemetry-response';
import type { GetRelationsResponse } from '@/app/racks/interfaces/get-relations-response';

export const deviceApi = {
  getDevices: async (pageSize: number = 50, page: number = 0): Promise<GetDevicesResponse> => {
    const { data } = await thingsboardClient.get('/api/tenant/devices', {
      params: {
        pageSize,
        page,
      },
    });
    return data;
  },

  getLatestTelemetry: async (deviceId: string, keys: string[] = ['status']): Promise<GetTelemetryResponse> => {
    const { data } = await thingsboardClient.get(`/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries`, {
      params: {
        keys: keys.join(','),
      },
    });
    return data;
  },

  getTelemetryHistory: async (deviceId: string, keys: string[], params: { startTs: number; endTs: number; interval?: number; agg: 'NONE' | 'AVG' }): Promise<GetTelemetryResponse> => {
    const { data } = await thingsboardClient.get(`/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries`, {
      params: {
        keys: keys.join(','),
        limit: 10_000,
        ...params,
      },
    });
    return data;
  },

  getAttributes: async (deviceId: string, keys: string[] = ['active']): Promise<GetAttributesResponse[]> => {
    const { data } = await thingsboardClient.get(`/api/plugins/telemetry/DEVICE/${deviceId}/values/attributes`, {
      params: {
        keys: keys.join(','),
      },
    });
    return data;
  },

  saveSharedAttributes: async (deviceId: string, attributes: Record<string, number>): Promise<void> => {
    await thingsboardClient.post(`/api/plugins/telemetry/DEVICE/${deviceId}/attributes/SHARED_SCOPE`, attributes);
  },

  getAssignedRacks: async (deviceId: string): Promise<GetRelationsResponse[]> => {
    const { data } = await thingsboardClient.get('/api/relations/info', {
      params: {
        toId: deviceId,
        toType: 'DEVICE',
        relationType: 'Contains',
      },
    });
    return data;
  },
};
