import { deviceApi } from '@/app/devices/api/device-api';
import { rackApi } from '../api/rack-api';
import type { DetectedTag, LinkedEntity, RfidLinks } from '../interfaces/rfid-links';

export const getRfidLinksAction = async (): Promise<RfidLinks> => {
  const [racks, nodes] = await Promise.all([rackApi.getRackTags(), deviceApi.getNodeTags()]);

  const rackByUid = new Map<string, LinkedEntity>();
  racks.data.forEach(({ entityId, latest }) => {
    const uid = latest.SERVER_ATTRIBUTE?.rfid_uid?.value.toUpperCase();
    const name = latest.SERVER_ATTRIBUTE?.rack_name?.value || latest.ENTITY_FIELD?.name?.value || '';
    if (uid) rackByUid.set(uid, { id: entityId.id, name });
  });

  const readings = nodes.data
    .map(({ entityId, latest }) => ({
      id: entityId.id,
      name: latest.ENTITY_FIELD?.name?.value ?? '',
      uid: latest.CLIENT_ATTRIBUTE?.rack_uid?.value.toUpperCase() ?? '',
      ts: latest.CLIENT_ATTRIBUTE?.rack_uid?.ts ?? 0,
    }))
    .filter((reading) => reading.uid)
    .sort((a, b) => b.ts - a.ts);

  const nodeByRackId: Record<string, LinkedEntity> = {};
  const rackByNodeId: Record<string, LinkedEntity> = {};
  const detectedTags = new Map<string, DetectedTag>();

  readings.forEach(({ id, name, uid, ts }) => {
    const rack = rackByUid.get(uid);

    if (!rack) {
      if (!detectedTags.has(uid)) detectedTags.set(uid, { uid, nodeName: name, ts });
      return;
    }

    if (nodeByRackId[rack.id]) return;
    nodeByRackId[rack.id] = { id, name };
    rackByNodeId[id] = rack;
  });

  return { nodeByRackId, rackByNodeId, detectedTags: [...detectedTags.values()] };
}
