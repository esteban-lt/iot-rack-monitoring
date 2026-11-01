import type { RackStatus, RackSummary } from '@/interfaces/rack-summary';
import { rackApi } from '../api/rack-api';
import { toAttributes } from '@/lib/to-attributes';
import { deviceApi } from '@/app/devices/api/device-api';
import type { Data as Asset } from '../interfaces/get-assets-response';
import type { RfidLinks } from '../interfaces/rfid-links';

const VALID_STATUSES: RackStatus[] = ['ok', 'warning', 'alarm', 'offline'];

const resolveRackStatus = (rawStatus: string | undefined, isActive: unknown): RackStatus => {
  if (isActive !== true) return 'offline';
  if (VALID_STATUSES.includes(rawStatus as RackStatus)) return rawStatus as RackStatus;
  return 'offline';
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

export const getRackSummaryAction = async (asset: Asset, links: RfidLinks): Promise<RackSummary> => {
  const attribute = toAttributes(await rackApi.getAttributes(asset.id.id));
  const node = links.nodeByRackId[asset.id.id];

  return {
    rack: {
      id: asset.id.id,
      name: String(attribute.rack_name ?? asset.name),
      location: String(attribute.location ?? ''),
      rfidUid: attribute.rfid_uid ? String(attribute.rfid_uid) : undefined,
      nodeId: node?.id,
      nodeName: node?.name,
    },
    status: node ? await getNodeStatus(node.id) : 'offline',
    // TODO: contar alarmas activas desde ThingsBoard
    activeAlarms: 0,
  };
}
