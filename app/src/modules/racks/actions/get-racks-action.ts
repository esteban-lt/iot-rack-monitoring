import type { RackStatus, RackSummary } from '@/interfaces/rack-summary';
import { rackApi } from '../api/rack-api';
import { deviceApi } from '@/modules/devices/api/device-api';

const VALID_STATUSES: RackStatus[] = ['ok', 'warning', 'alarm', 'offline'];

const resolveRackStatus = (rawStatus: string | undefined, isActive: unknown): RackStatus => {
  if (isActive !== true) return 'offline';
  if (VALID_STATUSES.includes(rawStatus as RackStatus)) return rawStatus as RackStatus;
  return 'offline';
}

const toAttributes = (attributes: { key: string; value: unknown }[]) => {
  return Object.fromEntries(attributes.map((attribute) => [attribute.key, attribute.value]));
}

const getNodeStatus = async (nodeId: string): Promise<RackStatus> => {
  const [telemetry, attributes] = await Promise.all([
    deviceApi.getLatestTelemetry(nodeId),
    deviceApi.getAttributes(nodeId, ['active']),
  ]);

  return resolveRackStatus(
    telemetry.status?.[0]?.value,
    toAttributes(attributes).active,
  );
};

export const getRacksAction = async (pageSize: number = 50, page: number = 0): Promise<RackSummary[]> => {
  const validatedPageSize = (pageSize > 0) ? pageSize : 50;
  const validatedPage = (page >= 0) ? page : 0;

  const assets = await rackApi.getAssets(validatedPageSize, validatedPage);
  
  return Promise.all(
    assets.data.map(async (asset): Promise<RackSummary> => {
      const [attributes, nodes] = await Promise.all([
        rackApi.getAttributes(asset.id.id),
        rackApi.getAssignedNodes(asset.id.id),
      ]);

      const attribute = toAttributes(attributes);
      const node = nodes[0] ?? null;

      return {
        rack: {
          id: asset.id.id,
          name: String(attribute.rack_name ?? asset.name),
          location: String(attribute.location ?? ''),
          rfidUid: attribute.rfid_uid ? String(attribute.rfid_uid) : undefined,
          nodeId: node?.to.id,
          nodeName: node?.toName ?? undefined,
        },
        status: node ? await getNodeStatus(node.to.id) : 'offline',
        // TODO: contar alarmas activas desde ThingsBoard
        activeAlarms: 0,
      };
    }),
  );
}
