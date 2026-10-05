import type { RackSummary } from '@/interfaces/rack-summary';

export const summaries: RackSummary[] = [
  { rack: { id: 'a-01', name: 'A-01', location: 'Pasillo A', rfidUid: '04B2C3D4E5F601', nodeId: 'Nodo-01' }, status: 'normal', activeAlarms: 0 },
  { rack: { id: 'a-02', name: 'A-02', location: 'Pasillo A', rfidUid: '04C3D4E5F60712', nodeId: 'Nodo-02' }, status: 'normal', activeAlarms: 0 },
  { rack: { id: 'b-01', name: 'B-01', location: 'Pasillo B', rfidUid: '04D4E5F6071823', nodeId: 'Nodo-03' }, status: 'warning', activeAlarms: 1 },
  { rack: { id: 'b-02', name: 'B-02', location: 'Pasillo B', rfidUid: '04A1B2C3D45E80', nodeId: 'Nodo-04' }, status: 'alarm', activeAlarms: 1 },
  { rack: { id: 'c-01', name: 'C-01', location: 'Pasillo C', rfidUid: '04E5F607182934', nodeId: 'Nodo-05' }, status: 'normal', activeAlarms: 0 },
  { rack: { id: 'c-02', name: 'C-02', location: 'Pasillo C', rfidUid: '04F6071829354A', nodeId: 'Nodo-06' }, status: 'offline', activeAlarms: 1 },
];
