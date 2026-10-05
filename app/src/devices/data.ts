import type { NodeSummary } from '@/interfaces/node-summary';
import type { TelemetrySample } from '@/interfaces/telemetry-sample';

const now = Date.now();

const sample = (rssi: number, secondsAgo: number): TelemetrySample => ({
  ts: now - secondsAgo * 1000,
  tilt: 0,
  tiltX: 0,
  tiltY: 0,
  vibRms: 0,
  accelX: 0,
  accelY: 0,
  accelZ: 1,
  tempC: 24,
  rssi,
  status: 'normal',
});

export const summaries: NodeSummary[] = [
  { node: { id: 'n-01', name: 'Nodo-01', mac: '24:6F:28:AB:CD:01', ip: '192.168.1.51', firmwareVersion: '1.0.0', isActive: true, rackId: 'A-01' }, latest: sample(-58, 1) },
  { node: { id: 'n-02', name: 'Nodo-02', mac: '24:6F:28:AB:CD:02', ip: '192.168.1.52', firmwareVersion: '1.0.0', isActive: true, rackId: 'A-02' }, latest: sample(-64, 2) },
  { node: { id: 'n-03', name: 'Nodo-03', mac: '24:6F:28:AB:CD:03', ip: '192.168.1.53', firmwareVersion: '1.0.0', isActive: true, rackId: 'B-01' }, latest: sample(-70, 1) },
  { node: { id: 'n-04', name: 'Nodo-04', mac: '24:6F:28:AB:CD:EF', ip: '192.168.1.50', firmwareVersion: '1.0.0', isActive: true, rackId: 'B-02' }, latest: sample(-61, 2) },
  { node: { id: 'n-05', name: 'Nodo-05', mac: '24:6F:28:AB:CD:05', ip: '192.168.1.55', firmwareVersion: '1.0.0', isActive: true, rackId: 'C-01' }, latest: sample(-66, 1) },
  { node: { id: 'n-06', name: 'Nodo-06', mac: '24:6F:28:AB:CD:06', ip: '192.168.1.56', firmwareVersion: '1.0.0', isActive: false, lastActivityTs: now - 3 * 24 * 3600 * 1000, rackId: 'C-02' } },
  { node: { id: 'n-07', name: 'Nodo-07', mac: '24:6F:28:AB:CD:07', ip: '192.168.1.57', firmwareVersion: '1.0.0', isActive: true }, latest: sample(-72, 3) },
];
