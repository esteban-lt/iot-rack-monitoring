import { thingsboardClient } from '@/services/api/thingsboard-client';
import type { GetAlarmsResponse } from '../interfaces/get-alarms-response';

interface GetAlarmsParams {
  pageSize: number;
  page: number;
  nodeId?: string;
  severityList?: string;
  statusList?: string;
  startTime?: number;
  endTime?: number;
}

export const alarmApi = {
  getAlarms: async ({ nodeId, ...params }: GetAlarmsParams): Promise<GetAlarmsResponse> => {
    const url = nodeId ? `/api/v2/alarm/DEVICE/${nodeId}` : '/api/v2/alarms';
    const { data } = await thingsboardClient.get(url, {
      params: {
        sortProperty: 'createdTime',
        sortOrder: 'DESC',
        ...params,
      },
    });
    return data;
  },
};
