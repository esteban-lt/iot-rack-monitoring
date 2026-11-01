import type { NodeSummary } from '@/interfaces/node-summary';
import { toAttributes } from '@/lib/to-attributes';
import { deviceApi } from '../api/device-api';
import { getRfidLinksAction } from '@/app/racks/actions/get-rfid-links-action';
import { getLatestTelemetrySampleAction } from './get-latest-telemetry-sample-action';

export const getDevicesAction = async (pageSize: number = 50, page: number = 0): Promise<NodeSummary[]> => {
  const validatedPageSize = (pageSize > 0) ? pageSize : 50;
  const validatedPage = (page >= 0) ? page : 0;

  const [devices, links] = await Promise.all([
    deviceApi.getDevices(validatedPageSize, validatedPage),
    getRfidLinksAction(),
  ]);

  return Promise.all(
    devices.data.map(async (device): Promise<NodeSummary> => {
      const attributes = await deviceApi.getAttributes(device.id.id, ['active', 'lastActivityTime', 'mac', 'ip', 'firmware_version']);
      const attribute = toAttributes(attributes);
      const rack = links.rackByNodeId[device.id.id];
      const isActive = attribute.active === true;

      return {
        node: {
          id: device.id.id,
          name: device.name,
          mac: attribute.mac ? String(attribute.mac) : undefined,
          ip: attribute.ip ? String(attribute.ip) : undefined,
          firmwareVersion: attribute.firmware_version ? String(attribute.firmware_version) : undefined,
          isActive,
          lastActivityTs: attribute.lastActivityTime ? Number(attribute.lastActivityTime) : undefined,
          rackId: rack?.id,
          rackName: rack?.name,
        },
        latest: isActive ? await getLatestTelemetrySampleAction(device.id.id) : undefined,
      };
    }),
  );
}
