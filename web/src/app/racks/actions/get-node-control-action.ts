import type { CalibrationStatus, NodeControl } from '@/interfaces/node-control';
import { toAttributes } from '@/lib/to-attributes';
import { deviceApi } from '@/app/devices/api/device-api';

const CALIBRATION_STATUSES: CalibrationStatus[] = ['none', 'scheduled', 'running', 'ok', 'failed'];

export const getNodeControlAction = async (nodeId: string): Promise<NodeControl> => {
  const attributes = await deviceApi.getAttributes(nodeId, ['buzzer_enabled', 'calibrated', 'calib_status', 'calib_ts']);
  const attribute = toAttributes(attributes);

  const status = attribute.calib_status as CalibrationStatus;
  const calibratedAt = Number(attribute.calib_ts);

  return {
    buzzerEnabled: attribute.buzzer_enabled !== false,
    calibrated: attribute.calibrated === true,
    calibrationStatus: CALIBRATION_STATUSES.includes(status) ? status : 'none',
    calibratedAt: calibratedAt > 0 ? calibratedAt : undefined,
  };
}
