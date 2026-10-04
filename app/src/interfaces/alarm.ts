export type AlarmType = 'tilt' | 'impact' | 'offline';
export type AlarmSeverity = 'warning' | 'critical';
export type AlarmStatus = 'active' | 'acknowledged' | 'cleared';

export interface Alarm {
  id: string;
  nodeId: string;
  rackId?: string;
  type: AlarmType;
  severity: AlarmSeverity;
  status: AlarmStatus;
  createdTs: number;
  ackTs?: number;
  clearTs?: number;
}
