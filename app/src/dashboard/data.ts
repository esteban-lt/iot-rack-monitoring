import type { RackSummary } from '@/interfaces/rack-summary';
import type { NodeStatus, TelemetrySample } from '@/interfaces/telemetry-sample';

const now = Date.now();

const sample = (tilt: number, vibRms: number, status: NodeStatus, secondsAgo: number): TelemetrySample => ({
  ts: now - secondsAgo * 1000,
  tilt,
  tiltX: tilt,
  tiltY: 0,
  vibRms,
  accelX: 0,
  accelY: 0,
  accelZ: 1,
  tempC: 24,
  rssi: -60,
  status,
});

export const summaries: RackSummary[] = [
  {
    rack: { id: 'b-02', name: 'B-02', location: 'Pasillo B', nodeId: 'Nodo-04' },
    status: 'alarm',
    latest: sample(5.8, 0.1, 'alarm', 2),
    lastImpact: { ts: now - 3600 * 1000, impactG: 2.35 },
    activeAlarms: 1,
  },
  {
    rack: { id: 'b-01', name: 'B-01', location: 'Pasillo B', nodeId: 'Nodo-03' },
    status: 'warning',
    latest: sample(3.6, 0.06, 'warning', 1),
    lastImpact: { ts: now - 24 * 3600 * 1000, impactG: 1.9 },
    activeAlarms: 1,
  },
  {
    rack: { id: 'a-01', name: 'A-01', location: 'Pasillo A', nodeId: 'Nodo-01' },
    status: 'normal',
    latest: sample(0.8, 0.03, 'normal', 1),
    activeAlarms: 0,
  },
  {
    rack: { id: 'a-02', name: 'A-02', location: 'Pasillo A', nodeId: 'Nodo-02' },
    status: 'normal',
    latest: sample(1.2, 0.04, 'normal', 2),
    activeAlarms: 0,
  },
  {
    rack: { id: 'c-01', name: 'C-01', location: 'Pasillo C', nodeId: 'Nodo-05' },
    status: 'normal',
    latest: sample(0.5, 0.02, 'normal', 1),
    activeAlarms: 0,
  },
  {
    rack: { id: 'c-02', name: 'C-02', location: 'Pasillo C', nodeId: 'Nodo-06' },
    status: 'offline',
    lastImpact: { ts: now - 3 * 24 * 3600 * 1000, impactG: 2.1 },
    activeAlarms: 1,
  },
];
