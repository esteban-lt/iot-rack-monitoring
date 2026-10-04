export type NodeStatus = 'normal' | 'warning' | 'alarm';

export interface TelemetrySample {
  ts: number;
  tilt: number;
  tiltX: number;
  tiltY: number;
  vibRms: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  tempC: number;
  rssi: number;
  status: NodeStatus;
}
