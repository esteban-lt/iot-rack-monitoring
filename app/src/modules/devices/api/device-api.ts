import { thingsboardClient } from '@/services/api/thingsboard-client';
import type { GetAttributesResponse } from '../interfaces/get-attributes-response';
import type { GetLatestTelemetryResponse } from '../interfaces/get-latest-telemetry-response';

export const deviceApi = {
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
};
