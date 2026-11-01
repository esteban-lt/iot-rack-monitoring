import type { EntityID } from '@/services/api/interfaces/entity-id';

export interface GetAlarmsResponse {
  data:          AlarmData[];
  totalPages:    number;
  totalElements: number;
  hasNext:       boolean;
}

export interface AlarmData {
  id:          EntityID;
  createdTime: number;
  type:        string;
  originator:  EntityID;
  severity:    string;
  status:      string;
  ackTs:       number;
  clearTs:     number;
}
