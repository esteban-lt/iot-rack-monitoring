export type AlarmSeverity = 'critical' | 'major' | 'minor' | 'warning' | 'indeterminate';
export type AlarmStatus = 'active-unack' | 'active-ack' | 'cleared-unack' | 'cleared-ack';

export interface Alarm {
  id: string;
  nodeId: string;
  rackName?: string;
  type: string;
  severity: AlarmSeverity;
  status: AlarmStatus;
  createdTs: number;
  ackTs?: number;
  clearTs?: number;
}
