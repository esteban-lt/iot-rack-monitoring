import type { NodeStatus, TelemetrySample } from '@/interfaces/telemetry-sample';
import { deviceApi } from '../api/device-api';

const TELEMETRY_KEYS = ['status', 'rssi', 'tilt', 'tilt_x', 'tilt_y', 'vib_rms', 'ax', 'ay', 'az', 'temp_c'];

const VALID_STATUSES: NodeStatus[] = ['ok', 'warning', 'alarm'];

export const getLatestTelemetrySampleAction = async (deviceId: string): Promise<TelemetrySample | undefined> => {
  const telemetry = await deviceApi.getLatestTelemetry(deviceId, TELEMETRY_KEYS);

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
