import { thingsboardSocket } from '@/services/api/thingsboard-socket';

export const alarmSocket = {
  subscribeToActiveCount: (onCount: (count: number) => void) =>
    thingsboardSocket.subscribe(
      {
        type: 'ALARM_COUNT',
        query: {
          entityFilter: { type: 'entityType', entityType: 'DEVICE' },
          statusList: ['ACTIVE'],
          severityList: [],
          typeList: [],
          searchPropagatedAlarms: false,
        },
      },
      ({ count }) => onCount(count ?? 0),
    ),
};
