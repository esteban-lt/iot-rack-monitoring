import type { Thresholds } from '@/interfaces/thresholds';
import { toAttributes } from '@/lib/to-attributes';
import { deviceApi } from '@/app/devices/api/device-api';

export const getThresholdsAction = async (nodeId: string): Promise<Thresholds> => {
  const attributes = await deviceApi.getAttributes(nodeId, ['tilt_warn_deg', 'tilt_alarm_deg', 'impact_g']);
  const attribute = toAttributes(attributes);

  return {
    tiltWarnDeg: Number(attribute.tilt_warn_deg ?? 0),
    tiltAlarmDeg: Number(attribute.tilt_alarm_deg ?? 0),
    impactG: Number(attribute.impact_g ?? 0),
  };
}
