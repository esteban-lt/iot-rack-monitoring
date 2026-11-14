import { TELEMETRY_KEYS } from '@/app/devices/actions/get-latest-telemetry-sample-action';
import type { EntityData } from '@/services/api/interfaces/get-entities-query-response';
import { thingsboardSocket } from '@/services/api/thingsboard-socket';

const LIVE_KEYS = [
  ...[...TELEMETRY_KEYS, 'impact_g'].map((key) => ({ type: 'TIME_SERIES', key })),
  { type: 'ATTRIBUTE', key: 'active' },
  { type: 'ATTRIBUTE', key: 'rack_uid' },
];

export const rackSocket = {
  subscribeToNodes: (nodeIds: string[], onUpdate: (nodes: EntityData[]) => void) =>
    thingsboardSocket.subscribe(
      {
        type: 'ENTITY_DATA',
        query: {
          entityFilter: { type: 'entityList', entityType: 'DEVICE', entityList: nodeIds },
          pageLink: { page: 0, pageSize: nodeIds.length },
          latestValues: LIVE_KEYS,
        },
        latestCmd: { keys: LIVE_KEYS },
      },
      ({ data, update }) => onUpdate(update ?? data?.data ?? []),
    ),
};
