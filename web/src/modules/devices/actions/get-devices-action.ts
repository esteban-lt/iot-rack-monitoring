import type { NodeSummary } from '@/interfaces/node-summary';
import type { NodeStatus, TelemetrySample } from '@/interfaces/telemetry-sample';
import { toAttributes } from '@/lib/to-attributes';
import { rackApi } from '@/modules/racks/api/rack-api';
import { deviceApi } from '../api/device-api';
import type { GetLatestTelemetryResponse } from '../interfaces/get-latest-telemetry-response';

const TELEMETRY_KEYS = ['status', 'rssi', 'tilt', 'tilt_x', 'tilt_y', 'vib_rms', 'ax', 'ay', 'az', 'temp_c'];

const VALID_STATUSES: NodeStatus[] = ['ok', 'warning', 'alarm'];

const toTelemetrySample = (telemetry: GetLatestTelemetryResponse): TelemetrySample | undefined => {
  const status = telemetry.status?.[0];
  if (!status || !VALID_STATUSES.includes(status.value as NodeStatus)) return undefined;

  const valueOf = (key: string) => Number(telemetry[key]?.[0]?.value ?? 0);

  return {
    ts: status.ts,
    tilt: valueOf('tilt'),
    tiltX: valueOf('tilt_x'),
    tiltY: valueOf('tilt_y'),
    vibRms: valueOf('vib_rms'),
    accelX: valueOf('ax'),
    accelY: valueOf('ay'),
    accelZ: valueOf('az'),
    tempC: valueOf('temp_c'),
    rssi: valueOf('rssi'),
    status: status.value as NodeStatus,
  };
}

const getAssignedRack = async (deviceId: string) => {
  const [relation] = await deviceApi.getAssignedRacks(deviceId);
  if (!relation) return undefined;

  const attributes = await rackApi.getAttributes(relation.from.id, ['rack_name']);

  return {
    rackId: relation.from.id,
    rackName: String(toAttributes(attributes).rack_name ?? relation.fromName ?? ''),
  };
}

export const getDevicesAction = async (pageSize: number = 50, page: number = 0): Promise<NodeSummary[]> => {
  const validatedPageSize = (pageSize > 0) ? pageSize : 50;
  const validatedPage = (page >= 0) ? page : 0;

  const devices = await deviceApi.getDevices(validatedPageSize, validatedPage);

  return Promise.all(
    devices.data.map(async (device): Promise<NodeSummary> => {
      const [attributes, rack] = await Promise.all([
        deviceApi.getAttributes(device.id.id, ['active', 'lastActivityTime', 'mac', 'ip', 'firmware_version']),
        getAssignedRack(device.id.id),
      ]);

      const attribute = toAttributes(attributes);
      const isActive = attribute.active === true;
      const telemetry = isActive ? await deviceApi.getLatestTelemetry(device.id.id, TELEMETRY_KEYS) : undefined;

      return {
        node: {
          id: device.id.id,
          name: device.name,
          mac: attribute.mac ? String(attribute.mac) : undefined,
          ip: attribute.ip ? String(attribute.ip) : undefined,
          firmwareVersion: attribute.firmware_version ? String(attribute.firmware_version) : undefined,
          isActive,
          lastActivityTs: attribute.lastActivityTime ? Number(attribute.lastActivityTime) : undefined,
          ...rack,
        },
        latest: telemetry && toTelemetrySample(telemetry),
      };
    }),
  );
}
