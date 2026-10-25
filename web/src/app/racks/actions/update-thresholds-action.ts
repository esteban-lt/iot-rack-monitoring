import type { Thresholds } from '@/interfaces/thresholds';
import { deviceApi } from '@/app/devices/api/device-api';

export const updateThresholdsAction = (nodeId: string, thresholds: Thresholds) => {
  return deviceApi.saveSharedAttributes(nodeId, {
    tilt_warn_deg: thresholds.tiltWarnDeg,
    tilt_alarm_deg: thresholds.tiltAlarmDeg,
    impact_g: thresholds.impactG,
  });
}
