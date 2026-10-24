export type AlarmType = 'high-tilt' | 'critical-tilt' | 'impact' | 'offline';
export type AlarmSeverity = 'warning' | 'major' | 'critical';
export type AlarmStatus = 'active-unack' | 'active-ack' | 'cleared-unack' | 'cleared-ack';

export interface Alarm {
  id: string;
  nodeId: string;
  rackId?: string;
  type: AlarmType;
  severity: AlarmSeverity;
  status: AlarmStatus;
  value?: number;
  createdTs: number;
  ackTs?: number;
  clearTs?: number;
}
