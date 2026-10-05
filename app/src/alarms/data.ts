import type { Alarm } from '@/interfaces/alarm';

const now = Date.now();
const minutesAgo = (minutes: number) => now - minutes * 60 * 1000;

export const alarms: Alarm[] = [
  { id: '1', nodeId: 'n-04', rackId: 'B-02', type: 'impact', severity: 'major', status: 'active-unack', value: 2.35, createdTs: minutesAgo(30) },
  { id: '2', nodeId: 'n-04', rackId: 'B-02', type: 'critical-tilt', severity: 'critical', status: 'active-unack', value: 5.1, createdTs: minutesAgo(33) },
  { id: '3', nodeId: 'n-03', rackId: 'B-01', type: 'high-tilt', severity: 'warning', status: 'active-ack', value: 3.2, createdTs: minutesAgo(60), ackTs: minutesAgo(50) },
  { id: '4', nodeId: 'n-06', rackId: 'C-02', type: 'offline', severity: 'major', status: 'active-unack', createdTs: minutesAgo(75) },
  { id: '5', nodeId: 'n-03', rackId: 'B-01', type: 'impact', severity: 'major', status: 'cleared-ack', value: 1.9, createdTs: minutesAgo(1000), ackTs: minutesAgo(990), clearTs: minutesAgo(980) },
  { id: '6', nodeId: 'n-02', rackId: 'A-02', type: 'high-tilt', severity: 'warning', status: 'cleared-ack', value: 3.4, createdTs: minutesAgo(1300), ackTs: minutesAgo(1290), clearTs: minutesAgo(1250) },
  { id: '7', nodeId: 'n-06', rackId: 'C-02', type: 'impact', severity: 'major', status: 'cleared-unack', value: 2.1, createdTs: minutesAgo(3000), clearTs: minutesAgo(2990) },
  { id: '8', nodeId: 'n-01', rackId: 'A-01', type: 'offline', severity: 'major', status: 'cleared-ack', createdTs: minutesAgo(4000), ackTs: minutesAgo(3990), clearTs: minutesAgo(3950) },
];
