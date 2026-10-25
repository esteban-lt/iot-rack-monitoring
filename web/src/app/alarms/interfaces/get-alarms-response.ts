import type { EntityID } from '@/app/racks/interfaces/get-relations-response';

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
