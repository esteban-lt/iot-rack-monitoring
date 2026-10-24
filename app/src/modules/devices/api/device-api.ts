import { thingsboardClient } from '@/services/api/thingsboard-client';
import type { GetAttributesResponse } from '../interfaces/get-attributes-response';
import type { GetDevicesResponse } from '../interfaces/get-devices-response';
import type { GetLatestTelemetryResponse } from '../interfaces/get-latest-telemetry-response';
import type { GetRelationsResponse } from '@/modules/racks/interfaces/get-relations-response';

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

  getLatestTelemetry: async (deviceId: string, keys: string[] = ['status']): Promise<GetLatestTelemetryResponse> => {
    const { data } = await thingsboardClient.get(`/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries`, {
      params: {
        keys: keys.join(','),
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
